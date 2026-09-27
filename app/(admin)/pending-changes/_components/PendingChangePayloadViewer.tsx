"use client";

import { Code } from "lucide-react";

interface PendingChangePayloadViewerProps {
  urlParams?: Record<string, unknown>;
  body?: Record<string, unknown>;
}

export function PendingChangePayloadViewer({ urlParams, body }: PendingChangePayloadViewerProps) {
  const hasParams = urlParams && Object.keys(urlParams).length > 0;
  const hasBody = body && Object.keys(body).length > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
        <Code className="w-3.5 h-3.5 text-slate-500" />
        <span>Operation Parameters & Payload</span>
      </div>

      {hasParams && (
        <div className="space-y-1">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Route URL Parameters
          </span>
          <div className="bg-slate-900 text-slate-100 rounded-xl p-3 text-xs font-mono overflow-x-auto">
            <pre className="whitespace-pre-wrap">{JSON.stringify(urlParams, null, 2)}</pre>
          </div>
        </div>
      )}

      {hasBody ? (
        <div className="space-y-1">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Request Body (Payload)
          </span>
          <div className="bg-slate-900 text-emerald-400 rounded-xl p-3 text-xs font-mono overflow-x-auto">
            <pre className="whitespace-pre-wrap">{JSON.stringify(body, null, 2)}</pre>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-500 italic">
          No body payload was supplied with this operation request.
        </div>
      )}
    </div>
  );
}
