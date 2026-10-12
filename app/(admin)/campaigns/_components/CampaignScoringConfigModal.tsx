"use client";

import { useState } from "react";
import {
  X,
  Sliders,
  History,
  Check,
  Building,
  Briefcase,
  Save,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import type { CampaignConfigVersionDTO } from "@/lib/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CampaignScoringConfigModalProps {
  activeConfig: CampaignConfigVersionDTO;
  history?: CampaignConfigVersionDTO[];
  onClose: () => void;
  onSaveConfig: (updated: CampaignConfigVersionDTO) => Promise<void>;
}

export function CampaignScoringConfigModal({
  activeConfig,
  history = [],
  onClose,
  onSaveConfig,
}: CampaignScoringConfigModalProps) {
  const [modelType, setModelType] = useState<"broker" | "propFirm">("broker");

  // Weights state
  const [brokerCpa, setBrokerCpa] = useState(activeConfig.brokerWeights.cpa);
  const [brokerRet, setBrokerRet] = useState(activeConfig.brokerWeights.retention);
  const [brokerVol, setBrokerVol] = useState(activeConfig.brokerWeights.volume);
  const [brokerComp, setBrokerComp] = useState(activeConfig.brokerWeights.compliance);

  const [propCpa, setPropCpa] = useState(activeConfig.propFirmWeights.cpa);
  const [propRet, setPropRet] = useState(activeConfig.propFirmWeights.retention);
  const [propVol, setPropVol] = useState(activeConfig.propFirmWeights.volume);
  const [propComp, setPropComp] = useState(activeConfig.propFirmWeights.compliance);

  // General parameters
  const [attainmentCap, setAttainmentCap] = useState(activeConfig.attainmentCapPct);
  const [reservePct, setReservePct] = useState(activeConfig.reservePct);
  const [bonusPct, setBonusPct] = useState(activeConfig.bonusPct);
  const [holdbackPct, setHoldbackPct] = useState(activeConfig.holdbackPct);
  const [changeNote, setChangeNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Presets
  const applyBrokerPreset = () => {
    setBrokerCpa(15);
    setBrokerRet(15);
    setBrokerVol(25);
    setBrokerComp(45);
    toast.info("Applied Standard Broker Preset (15/15/25/45)");
  };

  const applyPropFirmPreset = () => {
    setPropCpa(15);
    setPropRet(20);
    setPropVol(15);
    setPropComp(50);
    toast.info("Applied Prop Firm Preset (15/20/15/50)");
  };

  const brokerSum = brokerCpa + brokerRet + brokerVol + brokerComp;
  const propSum = propCpa + propRet + propVol + propComp;

  const handleSave = async () => {
    if (brokerSum !== 100 || propSum !== 100) {
      toast.error("Both Broker and Prop Firm weight allocations must sum exactly to 100%");
      return;
    }

    try {
      setIsSaving(true);
      const newVersionNum = parseFloat(activeConfig.configVersion.replace("v", "")) + 0.01;
      const newVersion = `v${newVersionNum.toFixed(2)}`;

      const updated: CampaignConfigVersionDTO = {
        configVersion: newVersion,
        brokerWeights: {
          cpa: brokerCpa,
          retention: brokerRet,
          volume: brokerVol,
          compliance: brokerComp,
        },
        propFirmWeights: {
          cpa: propCpa,
          retention: propRet,
          volume: propVol,
          compliance: propComp,
        },
        attainmentCapPct: attainmentCap,
        reservePct,
        bonusPct,
        holdbackPct,
        updatedAt: new Date().toISOString(),
        updatedBy: "admin@brdgr.com",
        changeNote: changeNote || `Updated scoring weights and audit version to ${newVersion}`,
      };

      await onSaveConfig(updated);
      toast.success(`Scoring configuration updated to version ${newVersion}`);
      onClose();
    } catch {
      toast.error("Failed to update scoring configuration");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Campaign Scoring Config & Version Audit
              </h3>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                {activeConfig.configVersion}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Configure attribution weights, caps, holdback rates, and maintain supervisory audit trails.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-200/60 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {/* Preset Buttons */}
          <div className="flex items-center gap-2 p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <div className="flex-1">
              <span className="text-xs font-bold text-blue-900">Official Specification Presets:</span>
              <p className="text-[11px] text-blue-700">
                Quick-apply validated regulatory weight profiles.
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={applyBrokerPreset}
                className="px-2.5 py-1 text-xs font-semibold bg-white text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 shadow-2xs cursor-pointer"
              >
                Broker (15/15/25/45)
              </button>
              <button
                type="button"
                onClick={applyPropFirmPreset}
                className="px-2.5 py-1 text-xs font-semibold bg-white text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50 shadow-2xs cursor-pointer"
              >
                Prop Firm (15/20/15/50)
              </button>
            </div>
          </div>

          {/* Model Weights Editor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Attribution Scoring Weights
              </span>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setModelType("broker")}
                  className={cn(
                    "px-2.5 py-1 rounded-md transition-all cursor-pointer",
                    modelType === "broker" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
                  )}
                >
                  Broker Model ({brokerSum}%)
                </button>
                <button
                  type="button"
                  onClick={() => setModelType("propFirm")}
                  className={cn(
                    "px-2.5 py-1 rounded-md transition-all cursor-pointer",
                    modelType === "propFirm" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
                  )}
                >
                  Prop Firm Model ({propSum}%)
                </button>
              </div>
            </div>

            {modelType === "broker" ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">CPA Attainment</span>
                    <span className="font-bold text-slate-900">{brokerCpa}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={brokerCpa}
                    onChange={(e) => setBrokerCpa(Number(e.target.value))}
                    className="w-full accent-[#0364FF] cursor-pointer"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">Trader Retention</span>
                    <span className="font-bold text-slate-900">{brokerRet}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={brokerRet}
                    onChange={(e) => setBrokerRet(Number(e.target.value))}
                    className="w-full accent-[#0364FF] cursor-pointer"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">Volume Attainment</span>
                    <span className="font-bold text-slate-900">{brokerVol}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={brokerVol}
                    onChange={(e) => setBrokerVol(Number(e.target.value))}
                    className="w-full accent-[#0364FF] cursor-pointer"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">Compliance Score</span>
                    <span className="font-bold text-emerald-700">{brokerComp}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="70"
                    value={brokerComp}
                    onChange={(e) => setBrokerComp(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">CPA Attainment</span>
                    <span className="font-bold text-slate-900">{propCpa}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={propCpa}
                    onChange={(e) => setPropCpa(Number(e.target.value))}
                    className="w-full accent-[#0364FF] cursor-pointer"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">Challenge Pass / Retention</span>
                    <span className="font-bold text-slate-900">{propRet}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={propRet}
                    onChange={(e) => setPropRet(Number(e.target.value))}
                    className="w-full accent-[#0364FF] cursor-pointer"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">Volume Attainment</span>
                    <span className="font-bold text-slate-900">{propVol}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={propVol}
                    onChange={(e) => setPropVol(Number(e.target.value))}
                    className="w-full accent-[#0364FF] cursor-pointer"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">Compliance Score</span>
                    <span className="font-bold text-emerald-700">{propComp}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="70"
                    value={propComp}
                    onChange={(e) => setPropComp(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Caps & Holdback Sliders */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Governance Controls & Safety Limits
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Attainment Cap</span>
                  <span className="font-bold text-slate-900">{attainmentCap}%</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="150"
                  value={attainmentCap}
                  onChange={(e) => setAttainmentCap(Number(e.target.value))}
                  className="w-full accent-[#0364FF] cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block">Spec standard: 120% cap</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Compliance Holdback</span>
                  <span className="font-bold text-slate-900">{holdbackPct}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="15"
                  value={holdbackPct}
                  onChange={(e) => setHoldbackPct(Number(e.target.value))}
                  className="w-full accent-[#0364FF] cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block">Spec standard: 10% – 15%</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Contingency Reserve</span>
                  <span className="font-bold text-slate-900">{reservePct}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="20"
                  value={reservePct}
                  onChange={(e) => setReservePct(Number(e.target.value))}
                  className="w-full accent-[#0364FF] cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block">Spec standard: 10% reserve</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Performance Bonus</span>
                  <span className="font-bold text-slate-900">{bonusPct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={bonusPct}
                  onChange={(e) => setBonusPct(Number(e.target.value))}
                  className="w-full accent-[#0364FF] cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block">Spec standard: 5% bonus pool</span>
              </div>
            </div>
          </div>

          {/* Change Note */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Supervisory Audit Note / Rationale
            </label>
            <input
              type="text"
              value={changeNote}
              onChange={(e) => setChangeNote(e.target.value)}
              placeholder="e.g. Updated compliance weights in accordance with regulatory update..."
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0364FF]"
            />
          </div>

          {/* Audit History */}
          {history.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-slate-400" /> Version Change Log
              </span>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                {history.map((ver) => (
                  <div key={ver.configVersion} className="p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{ver.configVersion}</span>
                      <span className="text-[10px] text-slate-400">
                        {ver.updatedAt ? new Date(ver.updatedAt).toLocaleDateString() : "Active"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">{ver.changeNote || "Standard release."}</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-mono">
                      <span>Broker: {ver.brokerWeights.cpa}/{ver.brokerWeights.retention}/{ver.brokerWeights.volume}/{ver.brokerWeights.compliance}</span>
                      <span>•</span>
                      <span>Prop: {ver.propFirmWeights.cpa}/{ver.propFirmWeights.retention}/{ver.propFirmWeights.volume}/{ver.propFirmWeights.compliance}</span>
                      <span>•</span>
                      <span>Cap: {ver.attainmentCapPct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">
            Audit Version: <strong className="text-slate-800">{activeConfig.configVersion}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              disabled={isSaving || brokerSum !== 100 || propSum !== 100}
              onClick={handleSave}
              className="px-5 py-2 text-xs font-bold text-white bg-[#0364FF] hover:bg-blue-600 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {isSaving ? "Saving..." : "Save & Increment Version"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
