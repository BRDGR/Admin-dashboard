"use client";

import { MapPin, Mail, Phone, Globe, Award, ExternalLink } from "lucide-react";
import type { PartnerProfile, User } from "@/lib/types";

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider w-36 shrink-0 mt-0.5">
        {label}
      </span>
      <span className="text-[13px] text-slate-800 font-medium">{value}</span>
    </div>
  );
}

function TagList({ label, items }: { label: string; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider w-36 shrink-0 mt-1">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {items.map((t) => (
          <span
            key={t}
            className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full text-[11px] font-medium"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

interface PartnerProfileCardProps {
  user: User;
  profile: PartnerProfile;
}

export function PartnerProfileCard({ user, profile }: PartnerProfileCardProps) {
  return (
    <div className="space-y-5">
      {/* Hero card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-[#0364FF]/10 to-indigo-50" />
        <div className="px-6 pb-6 -mt-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0364FF]/20 to-indigo-100 border-4 border-white flex items-center justify-center text-[#0364FF] font-bold text-xl shadow-sm">
            {user.firstName?.[0] || "P"}
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-900">
                {user.firstName} {user.lastName}
              </h2>
              {profile.isVetted && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Award className="w-3 h-3" /> Vetted
                </span>
              )}
            </div>
            {profile.bio && (
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-xl">
                {profile.bio}
              </p>
            )}
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              {profile.location && (
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {profile.location}
                </span>
              )}
              {profile.contactEmail && (
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {profile.contactEmail}
                </span>
              )}
              {profile.contactPhone && (
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {profile.contactPhone}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile details */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
        <p className="text-sm font-bold text-slate-900 mb-4">Profile Details</p>
        <InfoRow label="Years Experience" value={profile.yearsExperience} />
        <InfoRow label="Capacity" value={profile.capacity?.replace("_", " ")} />
        <InfoRow label="Partnership Exp." value={profile.partnershipExperience} />
        <TagList label="Industries" items={profile.industries} />
        <TagList label="Markets Served" items={profile.marketsServed} />
        <TagList label="Languages" items={profile.languages} />
        <TagList label="Niches" items={profile.niches} />
      </div>

      {/* Portfolio */}
      {profile.portfolio && profile.portfolio.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
          <p className="text-sm font-bold text-slate-900 mb-4">Portfolio</p>
          <div className="space-y-3">
            {profile.portfolio.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100"
              >
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-slate-900">{item.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-[#0364FF] hover:text-[#0052D4]"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
