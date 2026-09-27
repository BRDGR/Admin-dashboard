"use client";

import { Users, Building2, ShieldCheck, Link2, UserCheck, Clock } from "lucide-react";
import { format } from "date-fns";
import { AdminTopBar } from "@/components/layout";
import { MetricCard, SectionCard, StatusBadge } from "@/components/ui";
import { usePartners } from "@/lib/hooks/usePartners";
import { useOrganizations } from "@/lib/hooks/useOrganizations";
import { usePartnerKycList } from "@/lib/hooks/useKyc";
import { useByopRelationships } from "@/lib/hooks/useByop";
import { useUsers } from "@/lib/hooks/useUsers";

export default function OverviewPage() {
  const { data: partners, isLoading: loadingPartners } = usePartners(1, 5);
  const { data: orgs, isLoading: loadingOrgs } = useOrganizations(1, 1);
  const { data: kyc, isLoading: loadingKyc } = usePartnerKycList(1, 5);
  const { data: byop, isLoading: loadingByop } = useByopRelationships(1, 1);
  const { data: users, isLoading: loadingUsers } = useUsers(1, 1);

  const metrics = [
    {
      label: "Total Users",
      value: users?.pagination.totalRecords ?? 0,
      icon: Users,
      iconBg: "bg-blue-50 text-[#0364FF]",
      isLoading: loadingUsers,
    },
    {
      label: "Total Partners",
      value: partners?.pagination.totalRecords ?? 0,
      icon: UserCheck,
      iconBg: "bg-violet-50 text-violet-600",
      isLoading: loadingPartners,
    },
    {
      label: "Organizations",
      value: orgs?.pagination.totalRecords ?? 0,
      icon: Building2,
      iconBg: "bg-emerald-50 text-emerald-600",
      isLoading: loadingOrgs,
    },
    {
      label: "KYC Pending",
      value: kyc?.records?.filter((r) => r.status === "pending").length ?? 0,
      icon: ShieldCheck,
      iconBg: "bg-amber-50 text-amber-600",
      isLoading: loadingKyc,
    },
    {
      label: "BYOP Relationships",
      value: byop?.pagination.totalRecords ?? 0,
      icon: Link2,
      iconBg: "bg-rose-50 text-rose-500",
      isLoading: loadingByop,
    },
  ];

  return (
    <div className="space-y-6">
      <AdminTopBar />

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {metrics.map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Recent Partners — 2 cols */}
        <div className="lg:col-span-2">
          <SectionCard
            title="Recent Partners"
            subtitle="Latest partner profiles created"
            action={
              <a href="/partners" className="text-[11px] text-[#0364FF] font-semibold hover:underline">
                See all
              </a>
            }
          >
            {loadingPartners ? (
              <div className="divide-y divide-slate-50">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-slate-100 rounded-full animate-pulse w-32" />
                      <div className="h-2.5 bg-slate-100 rounded-full animate-pulse w-48" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {(partners?.partners ?? []).map(({ user, partnerProfile }) => {
                  const industries = Array.isArray(partnerProfile?.industries) ? partnerProfile.industries : [];

                  return (
                    <div key={user.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0364FF]/15 to-indigo-100 flex items-center justify-center text-[#0364FF] font-bold text-xs shrink-0">
                        {user.firstName?.[0] ?? "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-slate-900 truncate">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {partnerProfile.location || "Location unavailable"} · {industries.slice(0, 2).join(", ") || "No industries listed"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <StatusBadge status={partnerProfile.isVetted ? "approved" : "pending"} />
                        <span className="text-[11px] text-slate-400">
                          {format(new Date(user.createdAt), "MMM d")}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {(partners?.partners ?? []).length === 0 && (
                  <p className="px-5 py-10 text-center text-sm text-slate-400">No partners yet.</p>
                )}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Recent KYC — 1 col */}
        <div>
          <SectionCard
            title="KYC Queue"
            subtitle="Recent submissions"
            action={
              <a href="/kyc" className="text-[11px] text-[#0364FF] font-semibold hover:underline">
                Review all
              </a>
            }
          >
            {loadingKyc ? (
              <div className="divide-y divide-slate-50">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 animate-pulse shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-slate-100 rounded-full animate-pulse w-28" />
                      <div className="h-2.5 bg-slate-100 rounded-full animate-pulse w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {(kyc?.records ?? []).map((record, i) => (
                  <div key={record.kycRecordId ?? i} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-slate-900 truncate">
                        {record.partnerUser?.firstName} {record.partnerUser?.lastName}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-300" />
                        <span className="text-[10px] text-slate-400">
                          {record.submittedAt ? format(new Date(record.submittedAt), "MMM d, h:mm a") : "—"}
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={record.status ?? "pending"} />
                  </div>
                ))}
                {(kyc?.records ?? []).length === 0 && (
                  <p className="px-5 py-10 text-center text-sm text-slate-400">No KYC records.</p>
                )}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
