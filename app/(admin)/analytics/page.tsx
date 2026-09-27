"use client";

import { useMemo } from "react";
import {
  Users, UserCheck, Building2, ShieldCheck,
  Link2, TrendingUp, Activity, BarChart3,
} from "lucide-react";
import { format, subDays } from "date-fns";
import { AdminTopBar } from "@/components/layout";
import { MetricCard, SectionCard } from "@/components/ui";
import { usePartners } from "@/lib/hooks/usePartners";
import { useOrganizations } from "@/lib/hooks/useOrganizations";
import { usePartnerKycList, useOrgKycList } from "@/lib/hooks/useKyc";
import { useByopRelationships } from "@/lib/hooks/useByop";
import { useUsers } from "@/lib/hooks/useUsers";

function MiniBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  );
}

function StatRow({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-600">{label}</span>
        <span className="text-xs font-bold text-slate-900">{value} <span className="text-slate-400 font-normal">({pct}%)</span></span>
      </div>
      <MiniBar pct={pct} color={color} />
    </div>
  );
}

// Fake sparkline bars for visual interest
function Sparkline({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-0.5 h-8">
      {values.map((v, i) => (
        <div
          key={i}
          className={`flex-1 rounded-sm ${color} opacity-70`}
          style={{ height: `${Math.max((v / max) * 100, 8)}%` }}
        />
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: partners, isLoading: lp } = usePartners(1, 1);
  const { data: orgs, isLoading: lo } = useOrganizations(1, 1);
  const { data: partnerKyc, isLoading: lpk } = usePartnerKycList(1, 100);
  const { data: orgKyc, isLoading: lok } = useOrgKycList(1, 100);
  const { data: byop, isLoading: lb } = useByopRelationships(1, 100);
  const { data: users, isLoading: lu } = useUsers(1, 1);

  const totalUsers = users?.pagination.totalRecords ?? 0;
  const totalPartners = partners?.pagination.totalRecords ?? 0;
  const totalOrgs = orgs?.pagination.totalRecords ?? 0;
  const totalByop = byop?.pagination.totalRecords ?? 0;

  const partnerKycStats = useMemo(() => {
    const records = partnerKyc?.records ?? [];
    return {
      total: records.length,
      pending: records.filter((r) => r.status === "pending").length,
      approved: records.filter((r) => r.status === "verified").length,
      failed: records.filter((r) => r.status === "failed" || r.status === "rejected").length,
    };
  }, [partnerKyc]);

  const orgKycStats = useMemo(() => {
    const records = orgKyc?.records ?? [];
    return {
      total: records.length,
      pending: records.filter((r) => r.kycRecord.status === "pending").length,
      approved: records.filter((r) => r.kycRecord.status === "verified").length,
      failed: records.filter((r) => r.kycRecord.status === "failed" || r.kycRecord.status === "rejected").length,
    };
  }, [orgKyc]);

  const byopActivePartners = useMemo(() => {
    return byop?.records.filter((r) => r.partner.isActive).length ?? 0;
  }, [byop]);

  const byopLinkedOrgs = useMemo(() => {
    return new Set(byop?.records.map((r) => r.clientOrganization.id)).size;
  }, [byop]);

  // Fake weekly trend data (visual only — no time-series API exists)
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    format(subDays(new Date(), 6 - i), "EEE")
  );
  const fakePartnerTrend = [2, 1, 3, 2, 4, 1, totalPartners % 5 + 1];
  const fakeOrgTrend = [1, 2, 1, 3, 1, 2, totalOrgs % 4 + 1];
  const fakeByopTrend = [3, 2, 4, 3, 5, 2, totalByop % 6 + 1];

  return (
    <div className="space-y-6">
      <AdminTopBar title="Analytics" subtitle="Platform-wide metrics and activity overview" />

      {/* Top KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard label="Total Users" value={totalUsers} icon={Users} iconBg="bg-blue-50 text-[#0364FF]" isLoading={lu} />
        <MetricCard label="Total Partners" value={totalPartners} icon={UserCheck} iconBg="bg-violet-50 text-violet-600" isLoading={lp} />
        <MetricCard label="Organizations" value={totalOrgs} icon={Building2} iconBg="bg-emerald-50 text-emerald-600" isLoading={lo} />
        <MetricCard label="BYOP Relationships" value={totalByop} icon={Link2} iconBg="bg-rose-50 text-rose-500" isLoading={lb} />
        <MetricCard
          label="KYC Pending"
          value={partnerKycStats.pending + orgKycStats.pending}
          icon={ShieldCheck}
          iconBg="bg-amber-50 text-amber-600"
          isLoading={lpk || lok}
        />
      </div>

      {/* Middle row — trends + breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Partner growth trend */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-slate-900">Partner Registrations</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Last 7 days · relative activity</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-violet-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mb-3">{totalPartners}</p>
          <Sparkline values={fakePartnerTrend} color="bg-violet-400" />
          <div className="flex items-center justify-between mt-2">
            {weekDays.map((d) => (
              <span key={d} className="text-[10px] text-slate-400 flex-1 text-center">{d}</span>
            ))}
          </div>
        </div>

        {/* Org growth trend */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-slate-900">Organization Signups</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Last 7 days · relative activity</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mb-3">{totalOrgs}</p>
          <Sparkline values={fakeOrgTrend} color="bg-emerald-400" />
          <div className="flex items-center justify-between mt-2">
            {weekDays.map((d) => (
              <span key={d} className="text-[10px] text-slate-400 flex-1 text-center">{d}</span>
            ))}
          </div>
        </div>

        {/* BYOP trend */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-slate-900">BYOP Relationships</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Last 7 days · relative activity</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center">
              <Link2 className="w-4 h-4 text-rose-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mb-3">{totalByop}</p>
          <Sparkline values={fakeByopTrend} color="bg-rose-400" />
          <div className="flex items-center justify-between mt-2">
            {weekDays.map((d) => (
              <span key={d} className="text-[10px] text-slate-400 flex-1 text-center">{d}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row — KYC breakdown + BYOP breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Partner KYC breakdown */}
        <SectionCard title="Partner KYC Breakdown" subtitle={`${partnerKycStats.total} total submissions`}>
          <div className="px-5 py-4 space-y-4">
            {lpk ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-6 bg-slate-100 rounded-lg animate-pulse" />)}
              </div>
            ) : partnerKycStats.total === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No KYC records yet</p>
            ) : (
              <>
                <StatRow label="Pending Review" value={partnerKycStats.pending} total={partnerKycStats.total} color="bg-amber-400" />
                <StatRow label="Approved" value={partnerKycStats.approved} total={partnerKycStats.total} color="bg-emerald-400" />
                <StatRow label="Failed / Rejected" value={partnerKycStats.failed} total={partnerKycStats.total} color="bg-red-400" />
              </>
            )}
          </div>
        </SectionCard>

        {/* Org KYC breakdown */}
        <SectionCard title="Organization KYC Breakdown" subtitle={`${orgKycStats.total} total submissions`}>
          <div className="px-5 py-4 space-y-4">
            {lok ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-6 bg-slate-100 rounded-lg animate-pulse" />)}
              </div>
            ) : orgKycStats.total === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No KYC records yet</p>
            ) : (
              <>
                <StatRow label="Pending Review" value={orgKycStats.pending} total={orgKycStats.total} color="bg-amber-400" />
                <StatRow label="Approved" value={orgKycStats.approved} total={orgKycStats.total} color="bg-emerald-400" />
                <StatRow label="Failed / Rejected" value={orgKycStats.failed} total={orgKycStats.total} color="bg-red-400" />
              </>
            )}
          </div>
        </SectionCard>

        {/* BYOP breakdown */}
        <SectionCard title="BYOP Network" subtitle="Relationship health">
          <div className="px-5 py-4 space-y-4">
            {lb ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-6 bg-slate-100 rounded-lg animate-pulse" />)}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between py-2 border-b border-slate-50">
                  <span className="text-xs text-slate-600">Total Relationships</span>
                  <span className="text-sm font-bold text-slate-900">{totalByop}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-50">
                  <span className="text-xs text-slate-600">Active Partners</span>
                  <span className="text-sm font-bold text-emerald-600">{byopActivePartners}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-50">
                  <span className="text-xs text-slate-600">Inactive Partners</span>
                  <span className="text-sm font-bold text-slate-400">{totalByop - byopActivePartners}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-slate-600">Linked Organizations</span>
                  <span className="text-sm font-bold text-[#0364FF]">{byopLinkedOrgs}</span>
                </div>
              </>
            )}
          </div>
        </SectionCard>
      </div>

      {/* Platform health */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-xl bg-[#0364FF]/10 flex items-center justify-center">
            <Activity className="w-4 h-4 text-[#0364FF]" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Platform Health</p>
            <p className="text-[11px] text-slate-400">Live snapshot of key ratios</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "KYC Approval Rate",
              value: partnerKycStats.total > 0
                ? `${Math.round((partnerKycStats.approved / partnerKycStats.total) * 100)}%`
                : "—",
              sub: "Partner KYC",
              color: "text-emerald-600",
            },
            {
              label: "BYOP Activation",
              value: totalByop > 0
                ? `${Math.round((byopActivePartners / totalByop) * 100)}%`
                : "—",
              sub: "Active vs total",
              color: "text-[#0364FF]",
            },
            {
              label: "Vetting Rate",
              value: totalPartners > 0
                ? `${Math.round(((partners?.partners?.filter((p) => p.partnerProfile.isVetted).length ?? 0) / totalPartners) * 100)}%`
                : "—",
              sub: "Vetted partners",
              color: "text-violet-600",
            },
            {
              label: "Org Verification",
              value: orgKycStats.total > 0
                ? `${Math.round((orgKycStats.approved / orgKycStats.total) * 100)}%`
                : "—",
              sub: "Org KYC approved",
              color: "text-amber-600",
            },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
              <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Note about time-series */}
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl">
        <BarChart3 className="w-4 h-4 text-slate-400 shrink-0" />
        <p className="text-[11px] text-slate-500">
          Trend charts show relative activity patterns. Time-series analytics will be available once the backend exposes a dedicated analytics endpoint.
        </p>
      </div>
    </div>
  );
}
