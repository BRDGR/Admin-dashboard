"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { ShieldCheck, Mail, Lock, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const { login, isLoading, isInitializing, error, clearError, token } = useAdminAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Already logged in → go to dashboard
  useEffect(() => {
    if (!isInitializing && token) router.replace("/overview");
  }, [token, isInitializing, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login({ email, password });
      router.push("/overview");
    } catch {
      // error handled by context
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2F4F9]">
        <Loader2 className="w-5 h-5 animate-spin text-[#0364FF]" />
      </div>
    );
  }

  return (
    <main className="w-full min-h-screen flex bg-white">

      {/* ── Left Pane: Brand Hero ── */}
      <div className="hidden lg:flex lg:w-[46%] p-5 shrink-0">
        <div
          className="w-full h-full rounded-[28px] overflow-hidden p-10 flex flex-col justify-between relative select-none shadow-[0_20px_60px_-15px_rgba(3,100,255,0.35)]"
          style={{
            background: `
              radial-gradient(ellipse at 88% 18%, rgba(147,197,253,0.9) 0%, rgba(3,100,255,0.8) 45%, transparent 75%),
              radial-gradient(ellipse at 25% 85%, rgba(0,92,255,0.95) 0%, rgba(0,45,143,0.95) 50%, transparent 80%),
              radial-gradient(ellipse at 12% 15%, rgba(5,16,46,0.98) 0%, rgba(0,40,130,0.85) 50%, transparent 75%),
              linear-gradient(325deg, #0364ff 0%, #005cff 32%, #0038a8 68%, #061539 100%)
            `,
          }}
        >
          {/* Arc decorations */}
          <svg className="absolute top-0 left-0 w-[460px] h-[320px] pointer-events-none overflow-visible opacity-80" viewBox="0 0 500 370" fill="none">
            <path d="M -20,210 C 80,180 180,120 340,10" stroke="#FFFFFF" strokeWidth="14" strokeOpacity="0.35" strokeLinecap="round" className="blur-[8px]" />
            <path d="M -20,210 C 80,180 180,120 340,10" stroke="url(#tl-arc)" strokeWidth="2.5" strokeLinecap="round" />
            <defs>
              <linearGradient id="tl-arc" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fff" stopOpacity="0" />
                <stop offset="30%" stopColor="#fff" stopOpacity="0.95" />
                <stop offset="80%" stopColor="#fff" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#fff" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
          <svg className="absolute bottom-0 right-0 w-[460px] h-[320px] pointer-events-none overflow-visible opacity-80" viewBox="0 0 500 370" fill="none">
            <path d="M 160,360 C 320,260 420,200 520,-10" stroke="#FFFFFF" strokeWidth="14" strokeOpacity="0.35" strokeLinecap="round" className="blur-[8px]" />
            <path d="M 160,360 C 320,260 420,200 520,-10" stroke="url(#br-arc)" strokeWidth="2.5" strokeLinecap="round" />
            <defs>
              <linearGradient id="br-arc" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fff" stopOpacity="0" />
                <stop offset="30%" stopColor="#fff" stopOpacity="0.95" />
                <stop offset="80%" stopColor="#fff" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#fff" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

          {/* Logo */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/25 backdrop-blur-sm flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-xl tracking-tight leading-none">BRDGR</p>
              <p className="text-blue-200 text-[11px] font-semibold uppercase tracking-widest mt-0.5">Admin Console</p>
            </div>
          </div>

          {/* Hero text */}
          <div className="relative z-10 space-y-4">
            <p className="text-blue-200 text-xs font-semibold tracking-widest uppercase">Internal Operations</p>
            <h1 className="text-white font-bold text-[28px] leading-[1.25] tracking-tight max-w-sm">
              Manage the platform. <br />Control the ecosystem.
            </h1>
            <p className="text-white/75 text-sm leading-relaxed max-w-xs">
              Full visibility into partners, organizations, KYC reviews, and BYOP relationships — all in one place.
            </p>
            <div className="pt-3 border-t border-white/10">
              <p className="text-white/50 text-[11px] font-mono tracking-tight">
                Partners · Organizations · KYC · BYOP · Staff
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {["Role-based access", "256-bit SSL", "Audit logs"].map((badge) => (
                <span key={badge} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-white/80 text-[10px] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Pane: Login Form ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-10 lg:px-16 py-10 bg-[#F8FAFC] lg:bg-white">
        <div className="w-full max-w-[400px]">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-[#0364FF] flex items-center justify-center shadow-lg shadow-blue-500/25">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
            <p className="text-sm text-slate-500 mt-1.5">Sign in to your admin account to continue.</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 font-medium leading-relaxed">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { clearError(); setEmail(e.target.value); }}
                  placeholder="admin@brdgr.com"
                  className="w-full h-11 pl-10 pr-4 text-sm border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-[#0364FF]/20 focus:border-[#0364FF] transition-all placeholder:text-slate-400 text-slate-900"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => { clearError(); setPassword(e.target.value); }}
                  placeholder="••••••••"
                  className="w-full h-11 pl-10 pr-11 text-sm border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-[#0364FF]/20 focus:border-[#0364FF] transition-all placeholder:text-slate-400 text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl bg-[#0364FF] hover:bg-[#0252d4] active:scale-[0.99] text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
                  : "Sign in to Admin"
                }
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200/60 flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <p className="text-[11px] text-slate-400">Restricted access · Admin credentials only</p>
          </div>
        </div>
      </div>
    </main>
  );
}
