import Link from "next/link";
import { format } from "date-fns";
import {
  Building2,
  Mail,
  MapPin,
  Building,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import type { AdminClientRecord } from "@/lib/types";
import type { Column } from "@/components/ui";
import { StatusBadge } from "@/components/ui";

export function formatName(firstName?: string, lastName?: string): string {
  const parts = [firstName, lastName].filter(Boolean).map((p) => p!.trim()).filter(Boolean);
  if (!parts.length) return "Unnamed Client";
  return parts
    .join(" ")
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function getInitials(firstName?: string, lastName?: string, email?: string): string {
  const f = firstName?.trim();
  const l = lastName?.trim();
  if (f && l) return `${f[0]}${l[0]}`.toUpperCase();
  if (f) return f[0].toUpperCase();
  if (email) return email[0].toUpperCase();
  return "C";
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
        const initials = getInitials(client.user?.firstName, client.user?.lastName, client.user?.email);
        const name = formatName(client.user?.firstName, client.user?.lastName);

        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0364FF] font-bold text-xs flex items-center justify-center shrink-0 border border-blue-100/50">
              {initials}
            </div>
            <div>
              <p className="text-[13px] font-semibold text-slate-900 leading-tight">
                {name}
              </p>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate max-w-[200px]">{client.user?.email}</span>
              </p>
            </div>
          </div>
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
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-[13px] font-semibold text-slate-900 leading-tight">{org.name}</p>
              {org.isVerified && (
                <span title="Verified Corporate Entity">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                </span>
              )}
              {moreCount > 0 && (
                <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold">
                  +{moreCount}
                </span>
              )}
            </div>
            {org.companyType && (
              <span className="text-[10px] text-slate-500 font-medium capitalize">
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
        if (!country) return <span className="text-xs text-slate-400">—</span>;
        return (
          <div className="flex items-center gap-1 text-xs text-slate-600">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <span>{country}</span>
          </div>
        );
      },
    },
    {
      key: "orgStatus",
      header: "KYC / Standing",
      render: (client) => {
        const org = client.organization;
        if (!org) {
          return <span className="text-xs text-slate-400">—</span>;
        }
        return (
          <div className="flex flex-col gap-0.5">
            <StatusBadge status={org.status || "active"} />
            <span
              className={`text-[10px] font-semibold flex items-center gap-0.5 ${
                org.isVerified ? "text-emerald-600" : "text-slate-400"
              }`}
            >
              {org.isVerified ? "Verified" : "Unverified"}
            </span>
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Account",
      render: (client) => (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
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
        if (!date) return <span className="text-xs text-slate-400">—</span>;
        return (
          <span className="text-xs text-slate-500">
            {format(new Date(date), "MMM d, yyyy")}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (client) => (
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectClient(client)}
            className="flex items-center gap-1 text-xs font-semibold text-[#0364FF] hover:text-[#0256DC] hover:underline cursor-pointer"
          >
            View Details
            <ArrowRight className="w-3 h-3" />
          </button>
          {client.organization?.id && (
            <Link
              href={`/organizations/${client.organization.id}`}
              className="text-[11px] font-medium text-slate-400 hover:text-slate-800 transition-colors flex items-center gap-0.5"
              title="Open Organization Page"
            >
              <Building2 className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      ),
    },
  ];
}
