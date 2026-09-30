"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  UserPlus,
  Calendar,
  Edit2,
  Trash2,
  CheckCircle2,
  Sparkles,
  Tag,
} from "lucide-react";
import { format } from "date-fns";
import { AdminTopBar } from "@/components/layout";
import {
  DataTable,
  MetricCard,
  UserAvatarCell,
  TableActionButton,
  StatusBadge,
} from "@/components/ui";
import { listDirectoryContacts } from "@/lib/api/admin.api";
import type { DirectoryContact } from "@/lib/types";
import type { Column } from "@/components/ui";
import { CreateContactModal } from "./_components/CreateContactModal";
import { EditContactModal } from "./_components/EditContactModal";
import { DeleteContactDialog } from "./_components/DeleteContactDialog";
import { cn } from "@/lib/utils";

const PRIORITY_STYLES: Record<string, string> = {
  high: "bg-red-50 text-red-600 border border-red-200",
  medium: "bg-amber-50 text-amber-700 border border-amber-200",
  low: "bg-slate-100 text-slate-500 border border-slate-200",
};

export default function DirectoryPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<DirectoryContact | null>(null);
  const [deletingContact, setDeletingContact] = useState<DirectoryContact | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin", "directory-contacts", page],
    queryFn: async () => {
      const res = await listDirectoryContacts({ page, limit: 15 });
      return res.data?.data ?? null;
    },
  });

  const allContacts: DirectoryContact[] = data?.contacts ?? [];
  const pagination = data?.pagination;

  const filteredContacts = allContacts.filter((c) => {
    const matchesSearch =
      !search ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.source.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCount = pagination?.totalRecords ?? allContacts.length;
  const newCount = allContacts.filter((c) => c.status === "new").length;
  const qualifiedCount = allContacts.filter((c) => c.status === "qualified").length;
  const convertedCount = allContacts.filter((c) => c.status === "converted").length;

  const columns: Column<DirectoryContact>[] = [
    {
      key: "contact",
      header: "Lead Contact",
      sortable: true,
      render: (contact) => (
        <UserAvatarCell
          name={contact.name || "Unnamed"}
          subtitle={contact.email}
        />
      ),
    },
    {
      key: "source",
      header: "Source",
      sortable: true,
      render: (contact) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/60">
          {contact.source}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (contact) => <StatusBadge status={contact.status} />,
    },
    {
      key: "notes",
      header: "Notes & Tags",
      render: (contact) => {
        const notes = contact.notes;
        if (!notes) return <span className="text-xs text-slate-400">—</span>;
        const priority = notes.priority;
        const memo = notes.memo;
        const interests = notes.interests;
        return (
          <div className="space-y-1 max-w-[220px]">
            {priority && (
              <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${PRIORITY_STYLES[priority] ?? "bg-slate-100 text-slate-500"}`}>
                {priority} priority
              </span>
            )}
            {memo && <p className="text-xs text-slate-600 truncate">{memo}</p>}
            {interests && interests.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {interests.slice(0, 2).map((i) => (
                  <span key={i} className="inline-flex items-center gap-0.5 text-[10px] font-medium bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-md border border-indigo-100">
                    <Tag className="w-2.5 h-2.5" />{i}
                  </span>
                ))}
                {interests.length > 2 && (
                  <span className="text-[10px] text-slate-400">+{interests.length - 2}</span>
                )}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "addedBy",
      header: "Added By",
      render: (contact) =>
        contact.addedBy ? (
          <UserAvatarCell
            name={`${contact.addedBy.firstName} ${contact.addedBy.lastName}`}
            subtitle={contact.addedBy.email}
          />
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
    {
      key: "createdAt",
      header: "Recorded",
      sortable: true,
      render: (contact) => (
        <div className="space-y-0.5">
          <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            {contact.createdAt ? format(new Date(contact.createdAt), "MMM d, yyyy") : "—"}
          </span>
          {contact.notes?.initialContactDate && (
            <p className="text-[10px] text-slate-400">
              First contact: {format(new Date(contact.notes.initialContactDate), "MMM d, yyyy")}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (contact) => (
        <div className="flex items-center justify-end gap-1.5">
          <TableActionButton
            icon={<Edit2 className="w-3.5 h-3.5" />}
            label="Edit"
            onClick={() => setEditingContact(contact)}
            variant="outline"
          />
          <TableActionButton
            icon={<Trash2 className="w-3.5 h-3.5" />}
            label="Delete"
            onClick={() => setDeletingContact(contact)}
            variant="danger"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminTopBar
        title="Directory Contacts CRM"
        subtitle="Manage inbound leads, prospects, and outreach pipeline"
      />

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Inbound Leads" value={totalCount} icon={Users} iconBg="bg-blue-50 text-[#0364FF]" />
        <MetricCard label="New Leads" value={newCount} icon={Sparkles} iconBg="bg-purple-50 text-purple-600" />
        <MetricCard label="Qualified Leads" value={qualifiedCount} icon={CheckCircle2} iconBg="bg-amber-50 text-amber-600" />
        <MetricCard label="Converted Leads" value={convertedCount} icon={UserPlus} iconBg="bg-emerald-50 text-emerald-600" />
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60 overflow-x-auto">
          {(["all", "new", "contacted", "qualified", "unqualified", "converted"] as const).map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-xl capitalize transition-all cursor-pointer",
                statusFilter === st
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={filteredContacts}
        isLoading={isLoading}
        emptyMessage="No directory contacts found."
        searchPlaceholder="Search by name, email, or source..."
        searchValue={search}
        onSearchChange={setSearch}
        primaryAction={{
          label: "Add Contact",
          icon: <UserPlus className="w-3.5 h-3.5" />,
          onClick: () => setIsCreateOpen(true),
        }}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        getRowId={(r) => String(r.id)}
        pagination={pagination}
        onPageChange={setPage}
      />

      {/* Modals */}
      <CreateContactModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSuccess={() => refetch()} />
      <EditContactModal contact={editingContact} onClose={() => setEditingContact(null)} onSuccess={() => refetch()} />
      <DeleteContactDialog contact={deletingContact} onClose={() => setDeletingContact(null)} onSuccess={() => refetch()} />
    </div>
  );
}
