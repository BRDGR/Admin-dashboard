"use client";

import { useState, useMemo } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { UserPlus, X, Clock, Edit3 } from "lucide-react";
import { AdminTopBar } from "@/components/layout";
import {
  DataTable,
  StatusBadge,
  TableActionButton,
  UserAvatarCell,
  Button,
  type Column,
} from "@/components/ui";
import { useStaff, useCreateStaff, useSeedHistory } from "@/lib/hooks/useStaff";
import type { StaffMember, CreateStaffPayload, SeedHistoryRecord } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const TABS = ["Staff Members", "Seed History"] as const;
type StaffTab = typeof TABS[number];

const ROLE_BADGE: Record<string, string> = {
  admin:       "bg-rose-50 text-rose-700 border-rose-200/70",
  ops_admin:   "bg-amber-50 text-amber-700 border-amber-200/70",
  super_admin: "bg-purple-50 text-purple-700 border-purple-200/70",
};

const EMPTY_FORM: CreateStaffPayload = { firstName: "", lastName: "", email: "", role: "ops_admin" };

function InviteModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<CreateStaffPayload>(EMPTY_FORM);
  const { mutate, isPending } = useCreateStaff();
  const set = (k: keyof CreateStaffPayload, v: string) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md mx-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
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
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">First Name</label>
              <input
                required
                value={form.firstName}
                onChange={(e) => set("firstName", e.target.value)}
                placeholder="Jane"
                className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#0364FF]"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Last Name</label>
              <input
                required
                value={form.lastName}
                onChange={(e) => set("lastName", e.target.value)}
                placeholder="Doe"
                className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#0364FF]"
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Work Email</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="jane.doe@brdgr.com"
              className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#0364FF]"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Platform Role</label>
            <select
              value={form.role}
              onChange={(e) => set("role", e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-[#0364FF] bg-white cursor-pointer"
            >
              <option value="ops_admin">Operations Admin</option>
              <option value="admin">Administrator</option>
              <option value="super_admin">Super Administrator</option>
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button className="flex-1" type="submit" isLoading={isPending}>
              Send Invitation
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SeedHistoryTab() {
  const { data, isLoading } = useSeedHistory();
  const records = data?.history ?? [];

  if (isLoading) {
    return (
      <div className="p-6 space-y-3">
        {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />)}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-slate-400">
        No seed operations recorded.
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {records.map((record: SeedHistoryRecord) => (
        <div key={record.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-900">{record.name || (record as any).seedName || String(record.id)}</p>
            <div className="flex items-center gap-3">
              {record.version && (
                <span className="text-[10px] text-slate-400 font-mono">v{record.version}</span>
              )}
              {record.executedAt && (
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {format(new Date(record.executedAt), "MMM d, yyyy · h:mm a")}
                </span>
              )}
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate-400">#{record.id}</span>
        </div>
      ))}
    </div>
  );
}

export default function StaffPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [tab, setTab] = useState<StaffTab>("Staff Members");
  const { data, isLoading } = useStaff(page, pageSize);

  const rawStaff = data?.staff ?? [];

  const filteredStaff = useMemo(() => {
    if (!searchQuery.trim()) return rawStaff;
    const s = searchQuery.toLowerCase();
    return rawStaff.filter((st) => {
      const name = `${st.firstName ?? ""} ${st.lastName ?? ""}`.toLowerCase();
      const email = (st.email ?? "").toLowerCase();
      const role = (st.role ?? "").toLowerCase();
      return name.includes(s) || email.includes(s) || role.includes(s);
    });
  }, [rawStaff, searchQuery]);

  const columns: Column<StaffMember>[] = [
    {
      key: "name",
      header: "Staff Member",
      render: (s) => (
        <UserAvatarCell
          name={`${s.firstName ?? ""} ${s.lastName ?? ""}`.trim() || "Staff Member"}
          subtitle={s.email}
        />
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (s) => (
        <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border capitalize", ROLE_BADGE[s.role] ?? "bg-slate-50 text-slate-600 border-slate-200")}>
          {s.role.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (s) => <StatusBadge status={s.isActive ? "active" : "offline"} />,
    },
    {
      key: "lastLogin",
      header: "Last Active",
      render: (s) => s.lastLoginAt ? (
        <div>
          <p className="text-xs text-slate-700 whitespace-nowrap">{format(new Date(s.lastLoginAt), "MMM d, yyyy")}</p>
          <p className="text-[10px] text-slate-400 whitespace-nowrap">{formatDistanceToNow(new Date(s.lastLoginAt), { addSuffix: true })}</p>
        </div>
      ) : (
        <span className="text-xs text-slate-400">Never</span>
      ),
    },
    {
      key: "joined",
      header: "Joined",
      render: (s) => (
        <span className="text-xs text-slate-500 whitespace-nowrap">
          {format(new Date(s.createdAt), "MMM d, yyyy")}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (s) => (
        <div className="flex items-center justify-end gap-2">
          <TableActionButton
            icon={<Edit3 className="w-3.5 h-3.5" />}
            label="Edit"
            onClick={() => toast.info(`Edit staff member: ${s.email}`)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminTopBar title="Staff" subtitle="Manage admin and ops team members" />

      {/* Tabs */}
      <div className="flex items-center gap-1.5 pb-1">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer",
              tab === t
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-white border border-slate-200/90 text-slate-600 hover:bg-slate-50"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Staff Members" ? (
        <DataTable
          columns={columns}
          data={filteredStaff}
          isLoading={isLoading}
          emptyMessage="No staff members found matching criteria."
          selectable={true}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          itemLabel="Staff"
          searchPlaceholder="Search Staff Members"
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          primaryAction={{
            label: "Invite Staff",
            icon: <UserPlus className="w-3.5 h-3.5" />,
            onClick: () => setShowModal(true),
          }}
          pagination={data?.pagination}
          onPageChange={setPage}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <SeedHistoryTab />
        </div>
      )}

      {showModal && <InviteModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
