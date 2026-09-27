"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { deleteDirectoryContact } from "@/lib/api/admin.api";
import type { DirectoryContact } from "@/lib/types";
import { toast } from "sonner";

interface DeleteContactDialogProps {
  contact: DirectoryContact | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteContactDialog({ contact, onClose, onSuccess }: DeleteContactDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!contact) return null;

  async function handleDelete() {
    if (!contact) return;
    try {
      setIsDeleting(true);
      const res = await deleteDirectoryContact(contact.id);
      if (res.data?.error) {
        toast.error(res.data.message || "Failed to delete contact");
        return;
      }
      toast.success("Contact deleted from directory");
      onSuccess();
      onClose();
    } catch {
      toast.error("Failed to delete contact");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-100 p-6 space-y-4">
        <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900">Delete Contact?</h3>
          <p className="text-xs text-slate-500 mt-1">
            Are you sure you want to remove <span className="font-medium text-slate-800">{contact.name}</span> ({contact.email}) from the directory? This action cannot be undone.
          </p>
        </div>
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50"
          >
            {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
