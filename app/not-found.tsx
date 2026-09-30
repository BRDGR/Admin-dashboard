import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F2F4F9] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl border border-slate-200 text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0364FF] flex items-center justify-center mx-auto border border-blue-100">
          <FileQuestion className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-slate-900">Page Not Found</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            The admin route you requested does not exist or may have been moved.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/overview"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0364FF] hover:bg-[#0252D4] text-white text-xs font-semibold transition-all shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Overview</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
