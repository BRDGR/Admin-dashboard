"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  UserPlus,
  Search,
  Mail,
  Calendar,
  Edit2,
  Trash2,
  CheckCircle2,
  Sparkles,
  Tag,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { AdminTopBar } from "@/components/layout";
import { SectionCard, DataTable, MetricCard, Pagination, EmptyState } from "@/components/ui";
import { listDirectoryContacts } from "@/lib/api/admin.api";
import type { DirectoryContact, ContactStatus } from "@/lib/types";
import type { Column } from "@/components/ui";
import { CreateContactModal } from "./_components/CreateContactModal";
import { EditContactModal } from "./_components/EditContactModal";
import { DeleteContactDialog } from "./_components/DeleteContactDialog";

const STATUS_BADGES: Record<ContactStatus, { label: string; className: string }> = {
  new: { label: "New Lead", className: "bg-blue-50 text-blue-700 border-blue-200" },
  contacted: { label: "Contacted", className: "bg-purple-50 text-purple-700 border-purple-200" },
  qualified: { label: "Qualified", className: "bg-amber-50 text-amber-700 border-amber-200" },
  unqualified: { label: "Unqualified", className: "bg-slate-100 text-slate-600 border-slate-200" },
  converted: { label: "Converted", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

const PRIORITY_STYLES: Record<string, string> = {
  high: "bg-red-50 text-red-600",
  medium: "bg-amber-50 text-amber-700",
  low: "bg-slate-100 text-slate-500",
};

export default function DirectoryPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<DirectoryContact | null>(null);
  const [deletingContact, setDeletingContact] = useState<DirectoryContact | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin", "directory-contacts", page],
    queryFn: async () => {
      const res = await listDirectoryContacts({ page, limit: 15 });
      return res.data?.data;
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
      render: (contact) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0364FF] font-semibold text-xs flex items-center justify-center shrink-0">
            {(contact.name || "?").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-[13px] font-semibold text-slate-900">{contact.name || "Unnamed"}</p>
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <Mail className="w-3 h-3 text-slate-400" />
              {contact.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "source",
      header: "Source",
      render: (contact) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700">
          {contact.source}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (contact) => {
        const badge = STATUS_BADGES[contact.status] ?? { label: contact.status, className: "bg-slate-100 text-slate-600" };
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${badge.className}`}>
            {badge.label}
          </span>
        );
      },
    },
    {
      key: "notes",
      header: "Notes",
      render: (contact) => {
        const notes = contact.notes;
        if (!notes) return <span className="text-xs text-slate-400">—</span>;
        const priority = notes.priority;
        const memo = notes.memo;
        const interests = notes.interests;
        return (
          <div className="space-y-1 max-w-[200px]">
            {priority && (
              <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${PRIORITY_STYLES[priority] ?? "bg-slate-100 text-slate-500"}`}>
                {priority}
              </span>
            )}
            {memo && <p className="text-xs text-slate-600 truncate">{memo}</p>}
            {interests && interests.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {interests.slice(0, 2).map((i) => (
                  <span key={i} className="inline-flex items-center gap-0.5 text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-md">
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
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
              <User className="w-3 h-3 text-slate-400" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-700">
                {contact.addedBy.firstName} {contact.addedBy.lastName}
              </p>
              <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{contact.addedBy.email}</p>
            </div>
          </div>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
    {
      key: "createdAt",
      header: "Recorded",
      render: (contact) => (
        <div className="space-y-0.5">
          <span className="text-xs text-slate-500 flex items-center gap-1">
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
          <button
            onClick={() => setEditingContact(contact)}
            title="Edit Contact"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeletingContact(contact)}
            title="Delete Contact"
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Inbound Leads" value={totalCount} icon={Users} iconBg="bg-blue-50 text-[#0364FF]" />
        <MetricCard label="New Leads" value={newCount} icon={Sparkles} iconBg="bg-purple-50 text-purple-600" />
        <MetricCard label="Qualified Leads" value={qualifiedCount} icon={CheckCircle2} iconBg="bg-amber-50 text-amber-600" />
        <MetricCard label="Converted Leads" value={convertedCount} icon={UserPlus} iconBg="bg-emerald-50 text-emerald-600" />
      </div>

      <SectionCard
        title="Contacts Directory"
        subtitle={`${filteredContacts.length} contacts matching filters`}
        action={
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0364FF] hover:bg-[#0256DC] rounded-xl transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add Contact
          </button>
        }
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, or source..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0364FF]/20 focus:border-[#0364FF]"
            />
          </div>
          <div className="flex items-center gap-1 self-start sm:self-auto overflow-x-auto">
            {(["all", "new", "contacted", "qualified", "unqualified", "converted"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg capitalize transition-colors ${
                  statusFilter === st ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {filteredContacts.length === 0 && !isLoading ? (
          <EmptyState
            icon={Users}
            title="No contacts found"
            description={
              search || statusFilter !== "all"
                ? "Try adjusting your search criteria or status filter."
                : "Record your first lead or outreach contact to start managing your pipeline."
            }
          />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={filteredContacts}
              isLoading={isLoading}
              emptyMessage="No directory contacts available."
            />
            {pagination && (
              <div className="mt-4">
                <Pagination pagination={pagination} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </SectionCard>

      <CreateContactModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSuccess={() => refetch()} />
      <EditContactModal contact={editingContact} onClose={() => setEditingContact(null)} onSuccess={() => refetch()} />
      <DeleteContactDialog contact={deletingContact} onClose={() => setDeletingContact(null)} onSuccess={() => refetch()} />
    </div>
  );
}
