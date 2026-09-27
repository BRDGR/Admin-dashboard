"use client";

import { useState, useEffect } from "react";
import { X, Edit3, Loader2 } from "lucide-react";
import { updateDirectoryContact } from "@/lib/api/admin.api";
import type { DirectoryContact, ContactStatus } from "@/lib/types";
import { toast } from "sonner";

interface EditContactModalProps {
  contact: DirectoryContact | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditContactModal({ contact, onClose, onSuccess }: EditContactModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [source, setSource] = useState("");
  const [status, setStatus] = useState<ContactStatus>("new");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (contact) {
      setName(contact.name || "");
      setEmail(contact.email || "");
      setSource(contact.source || "Inbound Webform");
      setStatus(contact.status || "new");
      const memo = (contact.notes as Record<string, unknown>)?.memo;
      setNotes(typeof memo === "string" ? memo : "");
    }
  }, [contact]);

  if (!contact) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!contact) return;
    if (!name.trim() || !email.trim()) {
      toast.error("Please provide both name and email.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await updateDirectoryContact(contact.id, {
        name: name.trim(),
        email: email.trim(),
        source: source.trim(),
        status,
        notes: {
          ...(contact.notes || {}),
          memo: notes.trim(),
          updatedAtLocal: new Date().toISOString(),
        },
      });

      if (res.data?.error) {
        toast.error(res.data.message || "Failed to update directory contact");
        return;
      }

      toast.success("Contact updated successfully");
      onSuccess();
      onClose();
    } catch {
      toast.error("An error occurred while updating contact");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Edit Contact</h2>
              <p className="text-xs text-slate-500">Update pipeline status and contact details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0364FF]/20 focus:border-[#0364FF]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0364FF]/20 focus:border-[#0364FF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Source</label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0364FF]/20 focus:border-[#0364FF]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Lead Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ContactStatus)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0364FF]/20 focus:border-[#0364FF]"
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="unqualified">Unqualified</option>
                <option value="converted">Converted</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">Internal Notes / Log</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0364FF]/20 focus:border-[#0364FF] resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0364FF] hover:bg-[#0256DC] rounded-xl transition-all shadow-sm shadow-blue-500/20 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
