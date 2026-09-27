"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, RefreshCw, ShieldAlert, Zap } from "lucide-react";
import { SectionCard, Button, StatusBadge } from "@/components/ui";
import {
  getCampaignQueue,
  getCampaignPerformancePolicy,
  updateCampaignPerformancePolicy,
  evaluateCampaignPerformance,
  placeCampaignOnPip,
} from "@/lib/api/admin.api";
import type { CampaignPerformancePolicy, AdminCampaignQueueItem } from "@/lib/types";
import { toast } from "sonner";

const inputCls =
  "w-full text-sm bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0364FF]/20 focus:border-[#0364FF] transition-all";
const labelCls = "text-xs font-semibold text-slate-500 block mb-1.5";

function PolicyEditor({ campaignId, campaignName }: { campaignId: string; campaignName: string }) {
  const qc = useQueryClient();

  const { data: policy = {}, isLoading } = useQuery<CampaignPerformancePolicy>({
    queryKey: ["admin", "campaigns", campaignId, "policy"],
    queryFn: async () => {
      const res = await getCampaignPerformancePolicy(campaignId);
      if (!res.ok) throw new Error(res.error ?? "Failed to load policy");
      return res.data?.data?.policy ?? {};
    },
  });

  const [form, setForm] = useState<CampaignPerformancePolicy>({});
  const merged = { ...policy, ...form };

  const updateMutation = useMutation({
    mutationFn: () => updateCampaignPerformancePolicy(campaignId, merged),
    onSuccess: () => {
      toast.success("Policy updated");
      qc.invalidateQueries({ queryKey: ["admin", "campaigns", campaignId, "policy"] });
      setForm({});
    },
    onError: () => toast.error("Failed to update policy"),
  });

  const evaluateMutation = useMutation({
    mutationFn: () => evaluateCampaignPerformance(campaignId),
    onSuccess: () => toast.success("Evaluation triggered"),
    onError: () => toast.error("Evaluation failed"),
  });

  const pipMutation = useMutation({
    mutationFn: () =>
      placeCampaignOnPip(campaignId, {
        reason: "Manual admin PIP trigger",
        durationDays: 7,
        targetMetrics: { minConversionRate: merged.minConversionRate ?? 2 },
        autoPauseOnFailure: merged.autoPauseOnBreach ?? true,
      }),
    onSuccess: () => toast.success("PIP initiated"),
    onError: () => toast.error("Failed to initiate PIP"),
  });

  if (isLoading) {
    return (
      <div className="space-y-3 p-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-slate-900">{campaignName}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Performance SLA configuration</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            isLoading={evaluateMutation.isPending}
            onClick={() => evaluateMutation.mutate()}
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Evaluate Now
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-amber-600 border-amber-200 hover:bg-amber-50"
            isLoading={pipMutation.isPending}
            onClick={() => pipMutation.mutate()}
          >
            <ShieldAlert className="w-3.5 h-3.5 mr-1.5" /> Trigger PIP
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Min Conversion Rate (%)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            className={inputCls}
            defaultValue={merged.minConversionRate ?? 2}
            onChange={(e) => setForm((f) => ({ ...f, minConversionRate: parseFloat(e.target.value) }))}
          />
        </div>
        <div>
          <label className={labelCls}>Max CPA (USD)</label>
          <input
            type="number"
            min="0"
            className={inputCls}
            defaultValue={merged.maxCpa ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, maxCpa: parseFloat(e.target.value) }))}
          />
        </div>
        <div>
          <label className={labelCls}>Min Weekly Conversions</label>
          <input
            type="number"
            min="0"
            className={inputCls}
            defaultValue={merged.minWeeklyConversions ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, minWeeklyConversions: parseInt(e.target.value) }))}
          />
        </div>
        <div>
          <label className={labelCls}>Evaluation Frequency (days)</label>
          <input
            type="number"
            min="1"
            className={inputCls}
            defaultValue={merged.evaluationFrequencyDays ?? 7}
            onChange={(e) => setForm((f) => ({ ...f, evaluationFrequencyDays: parseInt(e.target.value) }))}
          />
        </div>
      </div>

      <div className="flex items-center justify-between py-3 border-t border-slate-100">
        <div>
          <p className="text-sm font-medium text-slate-800">Auto-Pause on Breach</p>
          <p className="text-xs text-slate-400 mt-0.5">Automatically pause campaign if SLA is breached</p>
        </div>
        <button
          type="button"
          onClick={() => setForm((f) => ({ ...f, autoPauseOnBreach: !(merged.autoPauseOnBreach ?? true) }))}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
            (merged.autoPauseOnBreach ?? true) ? "bg-[#0364FF]" : "bg-slate-200"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
              (merged.autoPauseOnBreach ?? true) ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      <Button
        isLoading={updateMutation.isPending}
        onClick={() => updateMutation.mutate()}
        disabled={Object.keys(form).length === 0}
      >
        <Save className="w-3.5 h-3.5 mr-1.5" /> Save Policy
      </Button>
    </div>
  );
}

export function CampaignPoliciesTab() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Backend rejects status param — fetch all, filter client-side for active + matching
  const { data: queueData, isLoading } = useQuery({
    queryKey: ["admin", "campaigns", "queue", 1],
    queryFn: async () => {
      const res = await getCampaignQueue({ page: 1, limit: 50 });
      if (!res.ok) throw new Error(res.error ?? "Failed to load campaigns");
      return res.data?.data;
    },
  });

  const allCampaigns: AdminCampaignQueueItem[] = queueData?.campaigns ?? queueData?.queue ?? [];
  const campaigns = allCampaigns.filter((c) => c.status === "active" || c.status === "matching");
  const selected = campaigns.find((c) => c.id === selectedId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <SectionCard title="Active Campaigns" subtitle="Select to configure SLA policy">
        {isLoading ? (
          <div className="divide-y divide-slate-50">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-slate-100 rounded-full animate-pulse w-32" />
                  <div className="h-2.5 bg-slate-100 rounded-full animate-pulse w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center px-5">
            <Zap className="w-8 h-8 text-slate-200 mb-2" />
            <p className="text-xs text-slate-400">No active or matching campaigns.</p>
            <p className="text-[11px] text-slate-300 mt-1">Activate a campaign from the Queue tab first.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {campaigns.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors cursor-pointer ${
                  selectedId === c.id ? "bg-blue-50/60" : "hover:bg-slate-50/60"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-slate-900 truncate">{c.name}</p>
                  <div className="mt-0.5">
                    <StatusBadge status={c.status} />
                  </div>
                </div>
                {selectedId === c.id && <span className="w-1.5 h-1.5 rounded-full bg-[#0364FF] shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </SectionCard>

      <div className="lg:col-span-2">
        {selected ? (
          <SectionCard title="SLA Policy" subtitle="Configure performance thresholds and automated governance">
            <PolicyEditor campaignId={selected.id} campaignName={selected.name} />
          </SectionCard>
        ) : (
          <SectionCard title="SLA Policy">
            <div className="flex flex-col items-center py-16 text-center px-5">
              <ShieldAlert className="w-10 h-10 text-slate-200 mb-3" />
              <p className="text-sm font-semibold text-slate-500">Select a campaign</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Choose an active or matching campaign to configure its performance SLA policy and trigger evaluations.
              </p>
            </div>
          </SectionCard>
        )}
      </div>
    </div>
  );
}
