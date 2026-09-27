"use client";

import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { UserPlus, X, History, ShieldCheck, Clock, CheckCircle2, XCircle } from "lucide-react";
import { AdminTopBar } from "@/components/layout";
import { SectionCard, DataTable, Pagination, Button } from "@/components/ui";
import { useStaff, useCreateStaff, useSeedHistory } from "@/lib/hooks/useStaff";
import type { StaffMember, CreateStaffPayload, SeedHistoryRecord } from "@/lib/types";
import type { Column } from "@/components/ui";
import { cn } from "@/lib/utils";

const TABS = ["Staff Members", "Seed History"] as const;
type StaffTab = typeof TABS[number];

const ROLE_BADGE: Record<string, string> = {
  admin:       "bg-rose-50 text-rose-700 border-rose-200",
  ops_admin:   "bg-amber-50 text-amber-700 border-amber-200",
  super_admin: "bg-purple-50 text-purple-700 border-purple-200",
};

const COLUMNS: Column<StaffMember>[] = [
  {
    key: "name",
    header: "Staff Member",
    render: (s) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-100 to-orange-50 flex items-center justify-center text-rose-600 font-bold text-xs shrink-0">
          {s.firstName?.[0] ?? "?"}{s.lastName?.[0] ?? ""}
        </div>
        <div>
          <p className="text-[13px] font-semibold text-slate-900">{s.firstName} {s.lastName}</p>
          <p className="text-[11px] text-slate-400">{s.email}</p>
        </div>
      </div>
    ),
  },
  {
    key: "role",
    header: "Roles",
    render: (s) => (
      <div className="flex flex-col gap-1">
        <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border w-fit capitalize", ROLE_BADGE[s.role] ?? "bg-slate-50 text-slate-600 border-slate-200")}>
          {s.role.replace(/_/g, " ")}
        </span>
        {s.staffRole && s.staffRole !== s.role && (
          <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border w-fit capitalize", ROLE_BADGE[s.staffRole] ?? "bg-slate-50 text-slate-600 border-slate-200")}>
            {s.staffRole.replace(/_/g, " ")}
          </span>
        )}
      </div>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (s) => (
      <div className="space-y-1">
        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
          s.isActive
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : "bg-slate-100 text-slate-500 border-slate-200"
        }`}>
          {s.isActive ? <><CheckCircle2 className="w-3 h-3" /> Active</> : <><XCircle className="w-3 h-3" /> Inactive</>}
        </span>
        <div className={`flex items-center gap-1 text-[10px] ${s.emailVerifiedAt ? "text-emerald-600" : "text-slate-400"}`}>
          <ShieldCheck className="w-3 h-3" />
          {s.emailVerifiedAt ? "Email verified" : "Unverified"}
        </div>
      </div>
    ),
  },
  {
    key: "lastLogin",
    header: "Last Login",
    render: (s) => s.lastLoginAt ? (
      <div>
        <p className="text-xs text-slate-700">{format(new Date(s.lastLoginAt), "MMM d, yyyy")}</p>
        <p className="text-[10px] text-slate-400">{formatDistanceToNow(new Date(s.lastLoginAt), { addSuffix: true })}</p>
      </div>
    ) : (
      <span className="text-xs text-slate-400">Never</span>
    ),
  },
  {
    key: "joined",
    header: "Joined",
    render: (s) => (
      <div>
        <p className="text-xs text-slate-600">{format(new Date(s.createdAt), "MMM d, yyyy")}</p>
        {s.updatedAt && s.updatedAt !== s.createdAt && (
          <p className="text-[10px] text-slate-400">Updated {format(new Date(s.updatedAt), "MMM d, yyyy")}</p>
        )}
      </div>
    ),
  },
];

const EMPTY_FORM: CreateStaffPayload = { firstName: "", lastName: "", email: "", role: "ops_admin" };

function InviteModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<CreateStaffPayload>(EMPTY_FORM);
  const { mutate, isPending } = useCreateStaff();
  const set = (k: keyof CreateStaffPayload, v: string) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <p className="text-sm font-bold text-slate-900">Invite Staff Member</p>
            <p className="text-[11px] text-slate-400 mt-0.5">They'll receive an email to set their password</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); mutate(form, { onSuccess: onClose }); }}
          className="px-6 py-5 space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            {(["firstName", "lastName"] as const).map((k) => (
              <div key={k}>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  {k === "firstName" ? "First Name" : "Last Name"}
                </label>
                <input
                  required value={form[k]}
                  onChange={(e) => set(k, e.target.value)}
                  className="w-full h-9 px-3 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0364FF]/20 focus:border-[#0364FF] transition-all"
                />
              </div>
            ))}
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Email</label>
            <input
              required type="email" value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className="w-full h-9 px-3 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0364FF]/20 focus:border-[#0364FF] transition-all"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Role</label>
            <select
              value={form.role}
              onChange={(e) => set("role", e.target.value)}
              className="w-full h-9 px-3 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0364FF]/20 focus:border-[#0364FF] transition-all bg-white"
            >
              <option value="ops_admin">Ops Admin</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1" isLoading={isPending}>Send Invite</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SeedHistoryTab() {
  const { data, isLoading } = useSeedHistory();
  const records = (data?.history ?? []) as SeedHistoryRecord[];

  if (isLoading) {
    return (
      <div className="divide-y divide-slate-50">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-5 py-3.5">
            <div className="w-7 h-7 rounded-lg bg-slate-100 animate-pulse shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-slate-100 rounded-full animate-pulse w-40" />
              <div className="h-2.5 bg-slate-100 rounded-full animate-pulse w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (records.length === 0) {
    return <p className="px-5 py-10 text-center text-sm text-slate-400">No seed history records.</p>;
  }

  return (
    <div className="divide-y divide-slate-50">
      {records.map((record) => (
        <div key={record.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
            <History className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-slate-900 font-mono">{record.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              {record.version != null && (
                <span className="text-[10px] text-slate-400">v{record.version}</span>
              )}
              {record.executedAt && (
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {format(new Date(record.executedAt), "MMM d, yyyy · h:mm a")}
                </span>
              )}
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate-300">#{record.id}</span>
        </div>
      ))}
    </div>
  );
}

export default function StaffPage() {
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [tab, setTab] = useState<StaffTab>("Staff Members");
  const { data, isLoading } = useStaff(page, 10);

  return (
    <div className="space-y-6">
      <AdminTopBar title="Staff" subtitle="Manage admin and ops team members" />

      <SectionCard
        title="Staff & History"
        subtitle={tab === "Staff Members" ? `${data?.pagination?.totalRecords ?? 0} total members` : "Seed operations log"}
        action={
          <div className="flex items-center gap-2">
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
            {tab === "Staff Members" && (
              <Button size="sm" onClick={() => setShowModal(true)}>
                <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                Invite Staff
              </Button>
            )}
          </div>
        }
      >
        {tab === "Staff Members" ? (
          <>
            <DataTable
              columns={COLUMNS}
              data={data?.staff ?? []}
              isLoading={isLoading}
              emptyMessage="No staff members yet."
            />
            {data?.pagination && <Pagination pagination={data.pagination} onPageChange={setPage} />}
          </>
        ) : (
          <SeedHistoryTab />
        )}
      </SectionCard>

      {showModal && <InviteModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
