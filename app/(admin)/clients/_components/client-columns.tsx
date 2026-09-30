import Link from "next/link";
import { format } from "date-fns";
import {
  Building2,
  MapPin,
  Building,
  ShieldCheck,
  Eye,
} from "lucide-react";
import type { AdminClientRecord } from "@/lib/types";
import type { Column } from "@/components/ui";
import { StatusBadge, TableActionButton, UserAvatarCell, TruncatedText } from "@/components/ui";

export function formatName(firstName?: string, lastName?: string): string {
  const parts = [firstName, lastName].filter(Boolean).map((p) => p!.trim()).filter(Boolean);
  if (!parts.length) return "Unnamed Client";
  return parts
    .join(" ")
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

interface GetClientColumnsProps {
  onSelectClient: (client: AdminClientRecord) => void;
}

export function getClientColumns({ onSelectClient }: GetClientColumnsProps): Column<AdminClientRecord>[] {
  return [
    {
      key: "client",
      header: "Client Account",
      render: (client) => {
        const name = formatName(client.user?.firstName, client.user?.lastName);
        return (
          <UserAvatarCell
            name={name}
            subtitle={client.user?.email || "—"}
            size="md"
          />
        );
      },
    },
    {
      key: "organization",
      header: "Corporate Entity",
      render: (client) => {
        const org = client.organization;
        if (!org) {
          return (
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
              <Building className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              <span className="italic">Unlinked</span>
            </span>
          );
        }

        const moreCount = (client.organizations?.length || 1) - 1;

        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 max-w-[240px]">
              <TruncatedText
                text={org.name}
                maxWidth="max-w-[200px]"
                label="Corporate Entity"
                className="text-sm font-semibold text-slate-900 leading-tight"
              />
              {org.isVerified && (
                <span title="Verified Corporate Entity">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                </span>
              )}
              {moreCount > 0 && (
                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold">
                  +{moreCount}
                </span>
              )}
            </div>
            {org.companyType && (
              <span className="text-xs text-slate-500 capitalize block leading-tight">
                {org.companyType}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "country",
      header: "Jurisdiction",
      render: (client) => {
        const country = client.organization?.country || client.partnerProfile?.location;
        if (!country) return <span className="text-sm text-slate-400">—</span>;
        return (
          <div className="flex items-center gap-1.5 text-sm text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate max-w-[140px]">{country}</span>
          </div>
        );
      },
    },
    {
      key: "orgStatus",
      header: "Standing",
      render: (client) => {
        const org = client.organization;
        if (!org) return <span className="text-sm text-slate-400">—</span>;
        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            <StatusBadge status={org.status || "active"} size="md" />
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Account",
      render: (client) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${
            client.user?.isActive
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-slate-100 text-slate-600 border-slate-200"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              client.user?.isActive ? "bg-emerald-500" : "bg-slate-400"
            }`}
          />
          {client.user?.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "created",
      header: "Joined",
      render: (client) => {
        const date = client.user?.createdAt || client.createdAt;
        if (!date) return <span className="text-sm text-slate-400">—</span>;
        return (
          <span className="text-xs text-slate-500 whitespace-nowrap">
            {format(new Date(date), "MMM d, yyyy")}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (client) => (
        <div className="flex items-center justify-end gap-2">
          <TableActionButton
            icon={<Eye className="w-3.5 h-3.5" />}
            label="Details"
            onClick={() => onSelectClient(client)}
            size="md"
          />
          {client.organization?.id && (
            <Link
              href={`/organizations/${client.organization.id}`}
              className="h-8 px-2.5 rounded-lg border border-slate-200/90 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Open Organization Page"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Org</span>
            </Link>
          )}
        </div>
      ),
    },
  ];
}
