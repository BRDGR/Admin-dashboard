"use client";

import { useState, useMemo } from "react";
import {
  RotateCcw,
  Clock,
  Building2,
  AlertTriangle,
  ShieldCheck,
  Search,
  Info,
  Check,
  X,
} from "lucide-react";
import type { CommercialValidationEvent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";

interface ValidationWorkQueueTableProps {
  readonly events: readonly CommercialValidationEvent[];
  readonly isLoading?: boolean;
  readonly onApprove: (eventId: string) => Promise<void>;
  readonly onReject: (eventId: string, reason: string) => Promise<void>;
  readonly onReverse: (eventId: string, reason: string) => Promise<void>;
}

const REJECTION_REASONS = [
  "Bot traffic cluster / anomalous click cadence",
  "Non-genuine trading activity / immediate withdrawal after FTD",
  "Geographic mismatch / VPN exit node detected",
  "Duplicate user registration / wash trading pattern",
  "Chargeback or payment refund issued",
  "Unapproved promotional channel / misleading ad creative",
  "Failure to pass client KYC / verification threshold",
];

function getFraudRiskBadgeClass(isHighRisk: boolean, isMediumRisk: boolean): string {
  if (isHighRisk) return "bg-rose-50 text-rose-700 border-rose-200";
  if (isMediumRisk) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-emerald-50 text-emerald-700 border-emerald-200";
}

function getEventStatusBadgeClass(status: string): string {
  switch (status) {
    case "approved":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "rejected":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "reversed":
      return "bg-purple-50 text-purple-700 border-purple-200";
    default:
      return "bg-amber-50 text-amber-700 border-amber-200";
  }
}

export function ValidationWorkQueueTable({
  events,
  isLoading,
  onApprove,
  onReject,
  onReverse,
}: Readonly<ValidationWorkQueueTableProps>) {
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [ageFilter, setAgeFilter] = useState<string>("ALL");
  const [clientFilter, setClientFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  // Action Modals State
  const [rejectingEvent, setRejectingEvent] = useState<CommercialValidationEvent | null>(null);
  const [rejectionReason, setRejectionReason] = useState(REJECTION_REASONS[0]);
  const [customRejectNote, setCustomRejectNote] = useState("");
  const [isSubmittingReject, setIsSubmittingReject] = useState(false);

  const [reversingEvent, setReversingEvent] = useState<CommercialValidationEvent | null>(null);
  const [reversalReason, setReversalReason] = useState("Clawback requested due to post-settlement chargeback");
  const [isSubmittingReverse, setIsSubmittingReverse] = useState(false);

  // Clients list
  const clientOptions = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => {
      if (e.clientName) set.add(e.clientName);
    });
    return Array.from(set);
  }, [events]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (statusFilter !== "ALL" && e.status !== statusFilter) return false;
      if (clientFilter !== "ALL" && e.clientName !== clientFilter) return false;
      if (ageFilter === "<24h" && e.ageHours >= 24) return false;
      if (ageFilter === "24-48h" && (e.ageHours < 24 || e.ageHours > 48)) return false;
      if (ageFilter === ">48h" && e.ageHours <= 48) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          e.id.toLowerCase().includes(q) ||
          e.partnerName.toLowerCase().includes(q) ||
          e.clientName.toLowerCase().includes(q) ||
          e.eventType.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [events, statusFilter, ageFilter, clientFilter, search]);

  const handleApprove = async (eventId: string) => {
    try {
      await onApprove(eventId);
      toast.success(`Approved commercial event ${eventId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to approve event");
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingEvent) return;
    try {
      setIsSubmittingReject(true);
      const finalReason = customRejectNote ? `${rejectionReason}: ${customRejectNote}` : rejectionReason;
      await onReject(rejectingEvent.id, finalReason);
      toast.success(`Event ${rejectingEvent.id} rejected.`);
      setRejectingEvent(null);
      setCustomRejectNote("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reject event");
    } finally {
      setIsSubmittingReject(false);
    }
  };

  const handleConfirmReverse = async () => {
    if (!reversingEvent) return;
    try {
      setIsSubmittingReverse(true);
      await onReverse(reversingEvent.id, reversalReason);
      toast.success(`Event ${reversingEvent.id} reversed with compensating transaction.`);
      setReversingEvent(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reverse event");
    } finally {
      setIsSubmittingReverse(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg">
            {(["pending", "approved", "rejected", "reversed", "ALL"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={cn(
                  "px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer capitalize",
                  statusFilter === st
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                {st === "ALL" ? "All Statuses" : st}
              </button>
            ))}
          </div>

          {/* Age Group Filter */}
          <select
            value={ageFilter}
            onChange={(e) => setAgeFilter(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium cursor-pointer"
          >
            <option value="ALL">All Ages</option>
            <option value="<24h">&lt; 24h (Urgent SLA)</option>
            <option value="24-48h">24h - 48h</option>
            <option value=">48h">&gt; 48h (SLA Warning)</option>
          </select>

          {/* Client Filter */}
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium cursor-pointer"
          >
            <option value="ALL">All Clients ({clientOptions.length})</option>
            {clientOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search event ID, client, partner..."
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0364FF]"
          />
        </div>
      </div>

      {/* Events Table */}
      <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Event ID</th>
                <th className="py-3 px-4">Client / Campaign</th>
                <th className="py-3 px-4">Partner</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Attribution Value</th>
                <th className="py-3 px-4">Age / Timestamp</th>
                <th className="py-3 px-4 text-center">Fraud Risk</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Supervisory Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Loading commercial validation queue...
                  </td>
                </tr>
              )}
              {!isLoading && filteredEvents.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No validation events found matching criteria.
                  </td>
                </tr>
              )}
              {!isLoading &&
                filteredEvents.map((event) => {
                  const isHighRisk = (event.fraudRiskScore ?? 0) >= 60;
                  const isMediumRisk =
                    (event.fraudRiskScore ?? 0) >= 30 && (event.fraudRiskScore ?? 0) < 60;

                  return (
                    <tr key={event.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* ID */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {event.id}
                      </td>

                      {/* Client & Campaign */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{event.clientName}</span>
                        </div>
                        {event.campaignName && (
                          <span className="text-[11px] text-slate-400 block truncate max-w-[180px]">
                            {event.campaignName}
                          </span>
                        )}
                      </td>

                      {/* Partner */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{event.partnerName}</div>
                        <span className="text-[11px] font-mono text-slate-400">
                          {event.partnerId}
                        </span>
                      </td>

                      {/* Event Type */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          {event.eventType.replace(/_/g, " ")}
                        </span>
                      </td>

                      {/* Value */}
                      <td className="py-3 px-4 font-bold text-slate-900">
                        ${(event.amountMinor / 100).toFixed(2)}{" "}
                        <span className="text-[10px] font-normal text-slate-400">
                          {event.currency}
                        </span>
                      </td>

                      {/* Age & Timestamp */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-slate-700 font-medium">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{event.ageHours}h ago</span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {format(new Date(event.occurredAt), "MMM d, HH:mm")}
                        </span>
                      </td>

                      {/* Fraud Risk Score */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border",
                            getFraudRiskBadgeClass(isHighRisk, isMediumRisk)
                          )}
                        >
                          {isHighRisk ? (
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                          ) : (
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          )}
                          {event.fraudRiskScore ?? 0}/100 Risk
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize",
                            getEventStatusBadgeClass(event.status)
                          )}
                        >
                          {event.status}
                        </span>
                        {event.reversalTxId && (
                          <span className="block text-[9px] font-mono text-purple-600 mt-0.5">
                            {event.reversalTxId}
                          </span>
                        )}
                      </td>

                      {/* Supervisory Actions */}
                      <td className="py-3 px-4 text-right">
                        {event.status === "pending" && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleApprove(event.id)}
                              className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                              title="Approve Commercial Event"
                            >
                              <Check className="w-3 h-3" /> Approve
                            </button>
                            <button
                              onClick={() => setRejectingEvent(event)}
                              className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                              title="Reject Event with Reason Code"
                            >
                              <X className="w-3 h-3" /> Reject
                            </button>
                          </div>
                        )}
                        {event.status === "approved" && (
                          <button
                            onClick={() => setReversingEvent(event)}
                            className="px-2.5 py-1 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                            title="Issue Compensating Reversal Ledger Transaction"
                          >
                            <RotateCcw className="w-3 h-3" /> Reverse
                          </button>
                        )}
                        {(event.status === "rejected" || event.status === "reversed") && (
                          <span
                            className="text-[11px] text-slate-400 italic truncate max-w-[150px] inline-block"
                            title={event.rejectionReason}
                          >
                            {event.rejectionReason || "Closed"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectingEvent && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Reject Commercial Event
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ID: <span className="font-mono font-bold text-slate-800">{rejectingEvent.id}</span> •{" "}
                  ${(rejectingEvent.amountMinor / 100).toFixed(2)} USD
                </p>
              </div>
              <button
                onClick={() => setRejectingEvent(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label
                  htmlFor="rejection-reason-select"
                  className="text-xs font-semibold text-slate-700 block mb-1"
                >
                  Mandatory Reason Code
                </label>
                <select
                  id="rejection-reason-select"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  {REJECTION_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="custom-reject-note-input"
                  className="text-xs font-semibold text-slate-700 block mb-1"
                >
                  Compliance / Audit Note (Optional)
                </label>
                <textarea
                  id="custom-reject-note-input"
                  value={customRejectNote}
                  onChange={(e) => setCustomRejectNote(e.target.value)}
                  placeholder="Provide additional evidence, ASN details, or telemetry reference..."
                  rows={3}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setRejectingEvent(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isSubmittingReject}
                onClick={handleConfirmReject}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg disabled:opacity-50 cursor-pointer"
              >
                {isSubmittingReject ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reverse Modal */}
      {reversingEvent && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Compensating Reversal
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Generate compensating ledger clawback for event{" "}
                  <span className="font-mono font-bold text-slate-800">{reversingEvent.id}</span>
                </p>
              </div>
              <button
                onClick={() => setReversingEvent(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p>
                Reversing creates an immutable compensating ledger record to claw back{" "}
                <span className="font-bold">${(reversingEvent.amountMinor / 100).toFixed(2)} USD</span>{" "}
                from partner without deleting original audit records.
              </p>
            </div>

            <div>
              <label
                htmlFor="reversal-reason-input"
                className="text-xs font-semibold text-slate-700 block mb-1"
              >
                Reversal & Clawback Reason
              </label>
              <input
                id="reversal-reason-input"
                value={reversalReason}
                onChange={(e) => setReversalReason(e.target.value)}
                placeholder="Reason for post-approval reversal..."
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setReversingEvent(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isSubmittingReverse}
                onClick={handleConfirmReverse}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-50 cursor-pointer"
              >
                {isSubmittingReverse ? "Reversing..." : "Execute Compensating Reversal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
