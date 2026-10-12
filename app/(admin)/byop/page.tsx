"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  Trash2,
  Link2,
  Users,
  Building2,
  ShieldCheck,
  Copy,
  Check,
  UserPlus,
  AlertTriangle,
  Eye,
  FolderTree,
  Table as TableIcon,
  KeyRound,
  Search,
  Landmark,
  TrendingUp,
} from "lucide-react";
import { AdminTopBar } from "@/components/layout";
import {
  DataTable,
  MetricCard,
  UserAvatarCell,
  TableActionButton,
  StatusBadge,
  Button,
} from "@/components/ui";
import {
  useByopRelationships,
  useDeleteByopInvitations,
  useByopAnalytics,
} from "@/lib/hooks/useByop";
import { useOrganizations } from "@/lib/hooks/useOrganizations";
import { listAdminInviteCodes } from "@/lib/api/admin.api";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { InviteByopModal } from "./_components/InviteByopModal";
import { AdminInviteCodeDetailModal } from "./_components/AdminInviteCodeDetailModal";
import { FirmFolderCard, type FirmFolderItem } from "./_components/FirmFolderCard";
import { FirmDrilldownView } from "./_components/FirmDrilldownView";
import type { ByopRelationship, AdminInviteCodeRecord } from "@/lib/types";
import type { Column } from "@/components/ui";
import { cn } from "@/lib/utils";

type MainViewMode = "folders" | "relationships" | "invite_codes";
type FirmCategory = "all" | "broker" | "prop_firm";

export default function ByopPage() {
  const [viewMode, setViewMode] = useState<MainViewMode>("folders");
  const [firmCategory, setFirmCategory] = useState<FirmCategory>("all");
  const [firmSearch, setFirmSearch] = useState("");
  const [selectedFirm, setSelectedFirm] = useState<FirmFolderItem | null>(null);

  // Flat relationships & invite codes state
  const [relPage, setRelPage] = useState(1);
  const [invitePage, setInvitePage] = useState(1);
  const [relSearch, setRelSearch] = useState("");
  const [inviteSearch, setInviteSearch] = useState("");
  const [selectedRelIds, setSelectedRelIds] = useState<string[]>([]);
  const [selectedCodeIds, setSelectedCodeIds] = useState<string[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteFirmId, setInviteFirmId] = useState<string | undefined>(undefined);
  const [showCleanupConfirm, setShowCleanupConfirm] = useState(false);
  const [detailCodeId, setDetailCodeId] = useState<string | null>(null);

  // Queries
  const { data: relsData, isLoading: loadingRels } = useByopRelationships(
    relPage,
    100,
    relSearch || undefined
  );
  const { data: orgsData, isLoading: loadingOrgs } = useOrganizations(1, 100);
  const { mutate: cleanup, isPending: cleaningPending } = useDeleteByopInvitations();
  const { data: analytics, isLoading: loadingAnalytics } = useByopAnalytics();

  const { data: inviteCodesData, isLoading: loadingInviteCodes } = useQuery({
    queryKey: ["admin", "invite-codes", invitePage],
    queryFn: async () => {
      const res = await listAdminInviteCodes({ page: invitePage, limit: 20 });
      const raw = res.data as any;
      const list = raw?.data?.inviteCodes || raw?.inviteCodes || raw?.data || [];
      return Array.isArray(list) ? (list as AdminInviteCodeRecord[]) : [];
    },
    enabled: viewMode === "invite_codes",
  });

  const totalRelationships =
    analytics?.totalRelationships ?? relsData?.pagination.totalRecords ?? 0;
  const activePartners = analytics?.activePartners ?? 0;
  const linkedOrgs = analytics?.linkedOrganizations ?? 0;

  // Process organizations and their BYOP partner counts into Firm Folder structures
  const firmFolders: FirmFolderItem[] = useMemo(() => {
    const relationships = relsData?.records ?? [];
    const orgs = orgsData?.organizations ?? [];

    // Map organization IDs to their relationships
    const relsByOrgId: Record<
      string,
      { total: number; active: number; name: string }
    > = {};

    relationships.forEach((r) => {
      const orgId = r.clientOrganization?.id;
      if (!orgId) return;
      if (!relsByOrgId[orgId]) {
        relsByOrgId[orgId] = {
          total: 0,
          active: 0,
          name: r.clientOrganization.name,
        };
      }
      relsByOrgId[orgId].total += 1;
      if (r.partner?.isActive) {
        relsByOrgId[orgId].active += 1;
      }
    });

    // Create a complete firm item for every organization in the system
    const map = new Map<string, FirmFolderItem>();

    orgs.forEach((o) => {
      const orgId = o.organization.id;
      const relStats = relsByOrgId[orgId] || { total: 0, active: 0 };
      map.set(orgId, {
        id: orgId,
        name: o.organization.name,
        email: o.organization.email,
        companyType: o.organization.companyType,
        country: o.organization.country,
        isVerified: o.organization.isVerified,
        totalPartners: relStats.total,
        activePartners: relStats.active,
      });
    });

    // Also include any organization found in relationships that wasn't in orgs list
    Object.keys(relsByOrgId).forEach((orgId) => {
      if (!map.has(orgId)) {
        const info = relsByOrgId[orgId];
        map.set(orgId, {
          id: orgId,
          name: info.name,
          totalPartners: info.total,
          activePartners: info.active,
        });
      }
    });

    return Array.from(map.values());
  }, [relsData, orgsData]);

  // Filter firm folders by category (Brokers vs Prop Firms) and search query
  const filteredFirmFolders = useMemo(() => {
    return firmFolders.filter((firm) => {
      const type = (firm.companyType || "").toLowerCase();
      const isBroker = type.includes("broker");
      const isPropFirm = type.includes("prop") || type.includes("funded");

      // 1. Category Tab Filter
      if (firmCategory === "broker" && !isBroker) return false;
      if (firmCategory === "prop_firm" && !isPropFirm) return false;

      // 2. Firm-Name Search Filter
      if (firmSearch.trim()) {
        const q = firmSearch.toLowerCase();
        const matchesName = firm.name.toLowerCase().includes(q);
        const matchesEmail = (firm.email || "").toLowerCase().includes(q);
        const matchesCountry = (firm.country || "").toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesCountry) return false;
      }

      return true;
    });
  }, [firmFolders, firmCategory, firmSearch]);

  const brokerFolderCount = useMemo(
    () =>
      firmFolders.filter((f) =>
        (f.companyType || "").toLowerCase().includes("broker")
      ).length,
    [firmFolders]
  );

  const propFolderCount = useMemo(
    () =>
      firmFolders.filter(
        (f) =>
          (f.companyType || "").toLowerCase().includes("prop") ||
          (f.companyType || "").toLowerCase().includes("funded")
      ).length,
    [firmFolders]
  );

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    toast.success(`Copied ${label} to clipboard`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Relationship Columns for Flat View
  const relationshipColumns: Column<ByopRelationship>[] = [
    {
      key: "partner",
      header: "Partner",
      sortable: true,
      render: ({ partner }) => (
        <UserAvatarCell
          name={`${partner.firstName} ${partner.lastName}`}
          subtitle={partner.email}
        />
      ),
    },
    {
      key: "org",
      header: "Client Organization",
      sortable: true,
      render: ({ clientOrganization }) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <span className="text-[13px] text-slate-800 font-semibold">
            {clientOrganization.name}
          </span>
        </div>
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
              {partner.emailVerifiedAt ? "Email verified" : "Email unverified"}
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
            title="Copy Relationship ID"
            className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {copiedCode === relationshipId ? (
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
      header: "Created",
      sortable: true,
      render: ({ createdAt, updatedAt }) => {
        const created = new Date(createdAt);
        const updated = new Date(updatedAt);
        const showUpdated =
          Math.abs(updated.getTime() - created.getTime()) > 60_000;
        return (
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-slate-700">
              {format(created, "MMM d, yyyy")}
            </p>
            {showUpdated && (
              <p className="text-[10px] text-slate-400">
                Updated {format(updated, "MMM d, yyyy")}
              </p>
            )}
          </div>
        );
      },
    },
    {
      key: "actions",
      header: "",
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <TableActionButton
            icon={
              copiedCode === item.relationshipId ? (
                <Check className="w-3 h-3 text-emerald-600" />
              ) : (
                <Copy className="w-3 h-3" />
              )
            }
            label={copiedCode === item.relationshipId ? "Copied" : "Copy ID"}
            onClick={() => handleCopy(item.relationshipId, "Relationship ID")}
            variant="outline"
          />
        </div>
      ),
    },
  ];

  // Invite Columns
  const inviteColumns: Column<AdminInviteCodeRecord>[] = [
    {
      key: "code",
      header: "Invite Code",
      sortable: true,
      render: ({ code, isActive }) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 border border-slate-200 px-2 py-1 rounded-lg">
            {code}
          </span>
          <StatusBadge status={isActive ? "active" : "inactive"} />
        </div>
      ),
    },
    {
      key: "organization",
      header: "Organization ID / Name",
      render: (item) => (
        <div className="flex items-center gap-2">
          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-700 font-medium">
            {item.organization?.name || item.orgId}
          </span>
        </div>
      ),
    },
    {
      key: "uses",
      header: "Usage / Cap",
      render: ({ usedCount, maxUses }) => (
        <span className="text-xs text-slate-700">
          <span className="font-semibold text-slate-900">{usedCount ?? 0}</span>
          <span className="text-slate-400">
            {" "}
            / {maxUses ? `${maxUses} max` : "Unlimited"}
          </span>
        </span>
      ),
    },
    {
      key: "expiresAt",
      header: "Expiration",
      render: ({ expiresAt }) => (
        <span className="text-xs text-slate-500">
          {expiresAt
            ? format(new Date(expiresAt), "MMM d, yyyy")
            : "No Expiry"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      render: ({ createdAt }) => (
        <span className="text-xs text-slate-400">
          {createdAt ? format(new Date(createdAt), "MMM d, yyyy") : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (item) => (
        <div className="flex items-center justify-end gap-1.5">
          <TableActionButton
            icon={<Eye className="w-3 h-3 text-[#0364FF]" />}
            label="Details"
            onClick={() => setDetailCodeId(item.id)}
            variant="outline"
          />
          <TableActionButton
            icon={
              copiedCode === item.code ? (
                <Check className="w-3 h-3 text-emerald-600" />
              ) : (
                <Copy className="w-3 h-3" />
              )
            }
            label={copiedCode === item.code ? "Copied" : "Copy Code"}
            onClick={() => handleCopy(item.code, "Invite Code")}
            variant="outline"
          />
        </div>
      ),
    },
  ];

  const filteredInviteCodes = (inviteCodesData ?? []).filter((item) => {
    if (!inviteSearch) return true;
    const q = inviteSearch.toLowerCase();
    return (
      item.code.toLowerCase().includes(q) ||
      (item.organization?.name &&
        item.organization.name.toLowerCase().includes(q)) ||
      item.orgId.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <AdminTopBar
        title="BYOP Management"
        subtitle="Bring Your Own Partner — manage client firm networks, folders, and invitations"
      />

      {/* Metrics Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          label="Total Relationships"
          value={totalRelationships}
          icon={Link2}
          iconBg="bg-blue-50 text-[#0364FF]"
          isLoading={loadingAnalytics}
        />
        <MetricCard
          label="Active Partners"
          value={activePartners}
          icon={Users}
          iconBg="bg-emerald-50 text-emerald-600"
          isLoading={loadingAnalytics}
        />
        <MetricCard
          label="Organizations Linked"
          value={linkedOrgs}
          icon={Building2}
          iconBg="bg-violet-50 text-violet-600"
          isLoading={loadingAnalytics}
        />
      </div>

      {/* Primary Navigation Modes (Folders vs Flat Relationships vs Invite Codes) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
        <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-2xl w-fit border border-slate-200/60">
          <button
            type="button"
            onClick={() => {
              setViewMode("folders");
              setSelectedFirm(null);
            }}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2",
              viewMode === "folders"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            <FolderTree className="w-3.5 h-3.5 text-[#0364FF]" />
            <span>Folders by Firm ({firmFolders.length})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setViewMode("relationships");
              setSelectedFirm(null);
            }}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2",
              viewMode === "relationships"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            <TableIcon className="w-3.5 h-3.5 text-slate-500" />
            <span>All Relationships ({relsData?.pagination.totalRecords ?? 0})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setViewMode("invite_codes");
              setSelectedFirm(null);
            }}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2",
              viewMode === "invite_codes"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            <KeyRound className="w-3.5 h-3.5 text-slate-500" />
            <span>Invite Codes ({inviteCodesData?.length ?? 0})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {viewMode === "relationships" && (
            <TableActionButton
              icon={<Trash2 className="w-3.5 h-3.5" />}
              label={cleaningPending ? "Cleaning..." : "Purge Expired"}
              onClick={() => setShowCleanupConfirm(true)}
              variant="danger"
            />
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setInviteFirmId(undefined);
              setShowInviteModal(true);
            }}
            className="text-xs flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Invite Partner
          </Button>
        </div>
      </div>

      {/* ─── VIEW 1: FOLDERS BY FIRM ─── */}
      {viewMode === "folders" && (
        <>
          {selectedFirm ? (
            /* Firm Drilldown: Associated Partners for the Selected Organization */
            <FirmDrilldownView
              firm={selectedFirm}
              onBack={() => setSelectedFirm(null)}
              onInvitePartner={(orgId) => {
                setInviteFirmId(orgId);
                setShowInviteModal(true);
              }}
            />
          ) : (
            /* Firm Folder Directory */
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Category Filter & Search Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Broker vs Prop Firm Category Filter */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {[
                    { id: "all", label: "All Firms", count: firmFolders.length },
                    { id: "broker", label: "Brokers", count: brokerFolderCount },
                    { id: "prop_firm", label: "Prop Firms", count: propFolderCount },
                  ].map((cat) => {
                    const isActive = firmCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setFirmCategory(cat.id as FirmCategory)}
                        className={cn(
                          "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2",
                          isActive
                            ? "bg-slate-900 text-white shadow-2xs"
                            : "bg-white border border-slate-200/90 text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        {cat.id === "broker" ? (
                          <Landmark className="w-3 h-3 text-[#0364FF]" />
                        ) : cat.id === "prop_firm" ? (
                          <TrendingUp className="w-3 h-3 text-purple-600" />
                        ) : (
                          <Building2 className="w-3 h-3 text-slate-400" />
                        )}
                        <span>{cat.label}</span>
                        <span
                          className={cn(
                            "px-1.5 py-0.2 rounded-full text-[10px] font-bold",
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-slate-100 text-slate-500"
                          )}
                        >
                          {cat.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Instant Firm-Name Search Bar */}
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={firmSearch}
                    onChange={(e) => setFirmSearch(e.target.value)}
                    placeholder="Search firm folder by name..."
                    className="w-full text-xs bg-white border border-slate-200/90 rounded-xl pl-9 pr-4 py-2 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0364FF]/20 focus:border-[#0364FF] transition-all"
                  />
                  {firmSearch && (
                    <button
                      type="button"
                      onClick={() => setFirmSearch("")}
                      className="text-xs text-slate-400 hover:text-slate-700 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Folders Grid */}
              {loadingOrgs || loadingRels ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="bg-white rounded-2xl border border-slate-200/80 p-5 h-36 animate-pulse"
                    />
                  ))}
                </div>
              ) : filteredFirmFolders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      No Firm Folders Found
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      {firmSearch
                        ? `No firm matches "${firmSearch}" in ${
                            firmCategory === "broker"
                              ? "Brokers"
                              : firmCategory === "prop_firm"
                              ? "Prop Firms"
                              : "firm directory"
                          }.`
                        : "No client firms registered in this category."}
                    </p>
                  </div>
                  {firmSearch && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFirmSearch("")}
                      className="text-xs"
                    >
                      Clear search
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredFirmFolders.map((firm) => (
                    <FirmFolderCard
                      key={firm.id}
                      firm={firm}
                      onSelect={(f) => setSelectedFirm(f)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ─── VIEW 2: FLAT RELATIONSHIPS TABLE ─── */}
      {viewMode === "relationships" && (
        <DataTable
          columns={relationshipColumns}
          data={relsData?.records ?? []}
          isLoading={loadingRels}
          emptyMessage="No BYOP relationships found."
          searchPlaceholder="Search by partner name or organization..."
          searchValue={relSearch}
          onSearchChange={(val) => {
            setRelSearch(val);
            setRelPage(1);
          }}
          primaryAction={{
            label: "Invite Partner",
            icon: <UserPlus className="w-3.5 h-3.5" />,
            onClick: () => setShowInviteModal(true),
          }}
          selectable
          selectedIds={selectedRelIds}
          onSelectionChange={setSelectedRelIds}
          getRowId={(r) => r.relationshipId}
          pagination={relsData?.pagination}
          onPageChange={setRelPage}
        />
      )}

      {/* ─── VIEW 3: INVITE CODES ─── */}
      {viewMode === "invite_codes" && (
        <DataTable
          columns={inviteColumns}
          data={filteredInviteCodes}
          isLoading={loadingInviteCodes}
          emptyMessage="No invite codes found across platform."
          searchPlaceholder="Search by invite code or organization..."
          searchValue={inviteSearch}
          onSearchChange={setInviteSearch}
          selectable
          selectedIds={selectedCodeIds}
          onSelectionChange={setSelectedCodeIds}
          getRowId={(r) => r.code}
        />
      )}

      {/* Modals */}
      {showInviteModal && (
        <InviteByopModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          defaultOrgId={inviteFirmId}
        />
      )}

      {showCleanupConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Clean Expired Invitations?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                This will purge all expired and declined BYOP partner invitations
                from the system. Active relationships will not be affected.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCleanupConfirm(false)}
                disabled={cleaningPending}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={cleaningPending}
                onClick={() => {
                  cleanup(undefined, {
                    onSettled: () => setShowCleanupConfirm(false),
                  });
                }}
              >
                Purge Invitations
              </Button>
            </div>
          </div>
        </div>
      )}

      {detailCodeId && (
        <AdminInviteCodeDetailModal
          codeId={detailCodeId}
          onClose={() => setDetailCodeId(null)}
        />
      )}
    </div>
  );
}
