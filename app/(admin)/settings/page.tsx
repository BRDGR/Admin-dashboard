"use client";

import { useState } from "react";
import { Bell, Shield, Settings2, User, ChevronRight, Save, Loader2 } from "lucide-react";
import { AdminTopBar } from "@/components/layout";
import { Button } from "@/components/ui";
import { useAdminProfile } from "@/lib/hooks/useStaff";
import { cn } from "@/lib/utils";

type Section = "profile" | "notifications" | "platform" | "security";

const SECTIONS: { key: Section; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "profile",       label: "Admin Profile",        icon: User      },
  { key: "notifications", label: "Notifications",        icon: Bell      },
  { key: "platform",      label: "Platform Config",      icon: Settings2 },
  { key: "security",      label: "Security",             icon: Shield    },
];

function Toggle({ label, sub, defaultOn = false }: { label: string; sub?: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0 gap-6">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{sub}</p>}
      </div>
      <button
        type="button"
        onClick={() => setOn(!on)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${on ? "bg-[#0364FF]" : "bg-slate-200"}`}
      >
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${on ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </div>
  );
}

const inputCls = "w-full text-sm bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0364FF]/20 focus:border-[#0364FF] transition-all";
const labelCls = "text-xs font-semibold text-slate-500 block mb-1.5";

export default function SettingsPage() {
  const [section, setSection] = useState<Section>("profile");
  const { data: adminProfile, isLoading } = useAdminProfile();
  const [saving, setSaving] = useState(false);

  const admin = (adminProfile as unknown as Record<string, Record<string, string>> | undefined)?.user;

  async function handleSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
  }

  const activeSection = SECTIONS.find((s) => s.key === section)!;

  return (
    <div className="space-y-6">
      <AdminTopBar title="Settings" subtitle="Platform configuration and admin preferences" />

      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* Left nav */}
        <div className="w-full lg:w-56 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-2 shrink-0 lg:sticky lg:top-4">
          <div className="space-y-0.5">
            {SECTIONS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setSection(key)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer text-left",
                  section === key
                    ? "bg-[#0364FF] text-white font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{label}</span>
                {section !== key && <ChevronRight className="w-3.5 h-3.5 opacity-30" />}
              </button>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8">

          {/* Panel header */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0364FF] flex items-center justify-center">
                <activeSection.icon className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">{activeSection.label}</h2>
            </div>
          </div>

          {/* ── Profile ── */}
          {section === "profile" && (
            <div className="space-y-5 max-w-md">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />)}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>First Name</label>
                      <input defaultValue={admin?.firstName ?? ""} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Last Name</label>
                      <input defaultValue={admin?.lastName ?? ""} className={inputCls} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Email Address</label>
                    <input defaultValue={admin?.email ?? ""} type="email" className={inputCls} readOnly />
                  </div>
                  <div>
                    <label className={labelCls}>Role</label>
                    <input defaultValue={admin?.role ?? "admin"} className={inputCls} readOnly />
                  </div>
                  <Button onClick={handleSave} isLoading={saving}>
                    <Save className="w-3.5 h-3.5 mr-1.5" /> Save Changes
                  </Button>
                </>
              )}
            </div>
          )}

          {/* ── Notifications ── */}
          {section === "notifications" && (
            <div className="space-y-1 max-w-lg">
              <p className="text-xs text-slate-400 mb-5">Choose which events send you an email notification.</p>
              <Toggle label="New partner registration" sub="When a new partner signs up and creates a profile" defaultOn />
              <Toggle label="KYC submission received" sub="When a partner or organization submits KYC documents" defaultOn />
              <Toggle label="KYC decision required" sub="Daily digest of pending KYC records awaiting review" defaultOn />
              <Toggle label="New organization onboarded" sub="When a client organization completes onboarding" defaultOn />
              <Toggle label="BYOP relationship created" sub="When a new BYOP partner-client link is established" />
              <Toggle label="Staff account created" sub="When a new staff member is invited to the platform" defaultOn />
              <Toggle label="Weekly platform summary" sub="Aggregated metrics every Monday morning" />
            </div>
          )}

          {/* ── Platform Config ── */}
          {section === "platform" && (
            <div className="space-y-8 max-w-lg">
              <div>
                <h3 className="text-xs font-bold text-[#0364FF] uppercase tracking-wide mb-1">Commission Settings</h3>
                <p className="text-xs text-slate-400 mb-5">Default platform fee applied to all partner payouts.</p>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Platform Fee (%)</label>
                    <input type="number" defaultValue={10} min={0} max={50} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Minimum Payout Threshold (USD)</label>
                    <input type="number" defaultValue={50} min={0} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Default Payout Schedule</label>
                    <select className={inputCls}>
                      <option value="monthly">Monthly (1st of month)</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-8">
                <h3 className="text-xs font-bold text-[#0364FF] uppercase tracking-wide mb-1">Fraud Gate</h3>
                <p className="text-xs text-slate-400 mb-5">Automated fraud detection thresholds.</p>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Risk Score Threshold (auto-reject above)</label>
                    <input type="number" defaultValue={0.85} step={0.05} min={0} max={1} className={inputCls} />
                  </div>
                  <Toggle label="Auto-reject high-risk conversions" sub="Automatically reject conversions with risk score above threshold" defaultOn />
                  <Toggle label="VPN / proxy detection" sub="Flag conversions from known VPN or proxy IP ranges" defaultOn />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-8">
                <h3 className="text-xs font-bold text-[#0364FF] uppercase tracking-wide mb-1">Matching Engine</h3>
                <p className="text-xs text-slate-400 mb-5">Controls for the partner-company matching algorithm.</p>
                <div className="space-y-4">
                  <Toggle label="Auto-matching enabled" sub="Automatically propose partner matches to companies" defaultOn />
                  <Toggle label="Require KYC for matching" sub="Only match vetted, KYC-approved partners" defaultOn />
                  <div>
                    <label className={labelCls}>Max proposals per company per week</label>
                    <input type="number" defaultValue={5} min={1} max={20} className={inputCls} />
                  </div>
                </div>
              </div>

              <Button onClick={handleSave} isLoading={saving}>
                <Save className="w-3.5 h-3.5 mr-1.5" /> Save Configuration
              </Button>
            </div>
          )}

          {/* ── Security ── */}
          {section === "security" && (
            <div className="space-y-8 max-w-md">
              <div>
                <h3 className="text-xs font-bold text-[#0364FF] uppercase tracking-wide mb-1">Change Password</h3>
                <p className="text-xs text-slate-400 mb-5">Use a strong password of at least 12 characters.</p>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Current Password</label>
                    <input type="password" placeholder="••••••••" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>New Password</label>
                    <input type="password" placeholder="••••••••" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Confirm New Password</label>
                    <input type="password" placeholder="••••••••" className={inputCls} />
                  </div>
                  <Button onClick={handleSave} isLoading={saving}>
                    {saving ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1.5" />}
                    Update Password
                  </Button>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-8">
                <h3 className="text-xs font-bold text-[#0364FF] uppercase tracking-wide mb-1">Two-Factor Authentication</h3>
                <p className="text-xs text-slate-400 mb-5">Add an extra layer of security to your admin account.</p>
                <Toggle label="Enable 2FA" sub="Require an authenticator app code on every login" />
              </div>

              <div className="border-t border-slate-100 pt-8">
                <h3 className="text-xs font-bold text-red-500 uppercase tracking-wide mb-1">Session Management</h3>
                <p className="text-xs text-slate-400 mb-4">Manage active admin sessions across devices.</p>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Current Session</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">This device · Active now</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>
                  </div>
                </div>
                <button className="mt-3 text-xs font-semibold text-red-500 hover:text-red-700 transition-colors">
                  Revoke all other sessions
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
