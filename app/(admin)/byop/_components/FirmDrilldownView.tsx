"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  Building2,
  Landmark,
  TrendingUp,
  UserPlus,
  ShieldCheck,
  Copy,
  Check,
  Eye,
  Search,
  Filter,
  CheckCircle2,
} from "lucide-react";
import {
  DataTable,
  StatusBadge,
  UserAvatarCell,
  TableActionButton,
  Button,
  type Column,
} from "@/components/ui";
import { useByopRelationships } from "@/lib/hooks/useByop";
import type { ByopRelationship } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { FirmFolderItem } from "./FirmFolderCard";

interface FirmDrilldownViewProps {
  firm: FirmFolderItem;
  onBack: () => void;
  onInvitePartner: (firmId: string) => void;
}

export function FirmDrilldownView({
  firm,
  onBack,
  onInvitePartner,
}: FirmDrilldownViewProps) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [partnerSearch, setPartnerSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [verificationFilter, setVerificationFilter] = useState<"all" | "verified" | "unverified">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch only partners connected to this specific firm
  const { data, isLoading } = useByopRelationships(
    page,
    pageSize,
    partnerSearch || undefined,
    firm.id
  );

  const rawRecords = data?.records ?? [];
  const pagination = data?.pagination;

  const isBroker = (firm.companyType || "").toLowerCase().includes("broker");
  const isPropFirm = (firm.companyType || "").toLowerCase().includes("prop");

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    toast.success(`Copied ${label} to clipboard`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter records based on operational parameters
  const filteredRecords = useMemo(() => {
    return rawRecords.filter((rel) => {
      // 1. Status Filter
      if (statusFilter === "active" && !rel.partner?.isActive) return false;
      if (statusFilter === "inactive" && rel.partner?.isActive) return false;

      // 2. Email Verification Filter
      if (verificationFilter === "verified" && !rel.partner?.emailVerifiedAt) return false;
      if (verificationFilter === "unverified" && rel.partner?.emailVerifiedAt) return false;

      return true;
    });
  }, [rawRecords, statusFilter, verificationFilter]);

  const columns: Column<ByopRelationship>[] = [
    {
      key: "partner",
      header: "Associated Partner",
      render: ({ partner }) => (
        <UserAvatarCell
          name={`${partner.firstName} ${partner.lastName}`}
          subtitle={partner.email}
        />
      ),
    },
    {
      key: "status",
      header: "Partner Status",
      render: ({ partner }) => (
        <div className="space-y-1">
          <StatusBadge status={partner.isActive ? "active" : "inactive"} />
          <div
            className={cn(
              "flex items-center gap-1 text-[11px]",
              partner.emailVerifiedAt ? "text-emerald-600" : "text-slate-400"
            )}
          >
            <ShieldCheck className="w-3 h-3" />
            <span>
              {partner.emailVerifiedAt ? "Email verified" : "Email pending"}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "relationshipId",
      header: "Relationship ID",
      render: ({ relationshipId }) => (
        <div className="flex items-center gap-1.5">
          <span
            className="text-xs font-mono text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60"
            title={relationshipId}
          >
            {relationshipId.slice(0, 8)}…
          </span>
          <button
            type="button"
            onClick={() => handleCopy(relationshipId, "Relationship ID")}
            title="Copy ID"
            className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {copiedId === relationshipId ? (
              <Check className="w-3 h-3 text-emerald-600" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        </div>
      ),
    },
    {
      key: "created",
      header: "Connected Date",
      render: ({ createdAt }) => (
        <span className="text-xs text-slate-500 whitespace-nowrap">
          {createdAt ? format(new Date(createdAt), "MMM d, yyyy") : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <TableActionButton
            icon={<Eye className="w-3.5 h-3.5" />}
            label="Profile"
            onClick={() => router.push(`/partners/${item.partner.id}`)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Top Banner / Firm Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={onBack}
              className="w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors cursor-pointer shrink-0 shadow-2xs"
              title="Return to Firm Folders"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div
              className={cn(
                "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border",
                isBroker
                  ? "bg-blue-50 text-[#0364FF] border-blue-100"
                  : isPropFirm
                  ? "bg-purple-50 text-purple-600 border-purple-100"
                  : "bg-slate-50 text-slate-600 border-slate-200"
              )}
            >
              {isBroker ? (
                <Landmark className="w-5 h-5" />
              ) : isPropFirm ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <Building2 className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{firm.name}</h2>
                <span
                  className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                    isBroker
                      ? "bg-blue-50 text-[#0364FF] border-blue-200"
                      : isPropFirm
                      ? "bg-purple-50 text-purple-700 border-purple-200"
                      : "bg-slate-100 text-slate-600 border-slate-200"
                  )}
                >
                  {isBroker ? "Brokerage Firm" : isPropFirm ? "Prop Trading Firm" : "Enterprise"}
                </span>
                {firm.isVerified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Verified Firm
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {firm.email || "Corporate Client"} {firm.country ? `· ${firm.country}` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="text-xs"
            >
              Back to Folders
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onInvitePartner(firm.id)}
              className="text-xs flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Invite Partner to {firm.name}
            </Button>
          </div>
        </div>

        {/* Operational Filter Bar for this Firm */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Operational Filters:</span>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0364FF]"
          >
            <option value="all">All Partner Statuses</option>
            <option value="active">Active Partners Only</option>
            <option value="inactive">Inactive Partners Only</option>
          </select>

          {/* Email Verification Filter */}
          <select
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value as typeof verificationFilter)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0364FF]"
          >
            <option value="all">All Verification States</option>
            <option value="verified">Email Verified Only</option>
            <option value="unverified">Email Unverified Only</option>
          </select>

          {(statusFilter !== "all" || verificationFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter("all");
                setVerificationFilter("all");
              }}
              className="text-xs text-[#0364FF] hover:underline font-semibold cursor-pointer"
            >
              Reset filters
            </button>
          )}

          <div className="ml-auto text-xs text-slate-400 font-medium">
            Showing {filteredRecords.length} of {pagination?.totalRecords ?? rawRecords.length} partners
          </div>
        </div>
      </div>

      {/* Associated Partners Data Table */}
      <DataTable
        columns={columns}
        data={filteredRecords}
        isLoading={isLoading}
        emptyMessage={`No BYOP partners found for ${firm.name}.`}
        searchPlaceholder={`Search partners in ${firm.name}...`}
        searchValue={partnerSearch}
        onSearchChange={(val) => {
          setPartnerSearch(val);
          setPage(1);
        }}
        itemLabel={`${firm.name} Partners`}
        pagination={pagination}
        onPageChange={setPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        getRowId={(r) => r.relationshipId}
      />
    </div>
  );
}
