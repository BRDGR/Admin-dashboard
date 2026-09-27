"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  X,
  Info,
  CheckCheck,
  Trash2,
  Megaphone,
  ShieldCheck,
  Mail,
  FileText,
  AlertTriangle,
} from "lucide-react";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "@/lib/api/admin.api";
import { useAdminAuth } from "@/context/AdminAuthContext";
import type { NotificationItem } from "@/lib/types";

const ADMIN_NOTIFICATIONS_KEY = ["admin", "notifications"] as const;

export function AdminNotificationCenter() {
  const { admin } = useAdminAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const query = useQuery({
    queryKey: ADMIN_NOTIFICATIONS_KEY,
    queryFn: async () => {
      const res = await fetchNotifications({ page: 1, limit: 15 });
      if (res.error) throw new Error(res.error);
      return res.data?.data ?? null;
    },
    enabled: Boolean(admin),
    refetchInterval: 30000,
    staleTime: 15000,
  });

  const notifications: NotificationItem[] = query.data?.notifications ?? [];
  const unreadCount =
    query.data?.unreadCount ??
    notifications.filter((n) => !n.readAt).length;

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await markNotificationAsRead(id);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_NOTIFICATIONS_KEY });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: async () => {
      const res = await markAllNotificationsAsRead();
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_NOTIFICATIONS_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await deleteNotification(id);
      if (res.error) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_NOTIFICATIONS_KEY });
    },
  });

  function getNotificationIcon(type: string) {
    if (type.includes("campaign")) return <Megaphone className="w-3.5 h-3.5 text-[#0364FF]" />;
    if (type.includes("kyc")) return <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />;
    if (type.includes("pending")) return <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />;
    if (type.includes("invite")) return <Mail className="w-3.5 h-3.5 text-purple-500" />;
    return <FileText className="w-3.5 h-3.5 text-slate-500" />;
  }

  function formatTimestamp(isoStr: string) {
    try {
      const date = new Date(isoStr);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        className="relative w-9 h-9 flex items-center justify-center rounded-full bg-white border border-slate-200/80 text-slate-500 hover:text-slate-900 shadow-xs transition-colors cursor-pointer"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 bg-[#0364FF] text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-11 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/60">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-[#0364FF]">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllMutation.mutate()}
                  disabled={markAllMutation.isPending}
                  className="text-[11px] font-medium text-[#0364FF] hover:text-[#0052D4] cursor-pointer disabled:opacity-50"
                >
                  Mark all read
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* List Content */}
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
                <Info className="w-4.5 h-4.5 text-slate-300" />
              </div>
              <p className="text-xs font-bold text-slate-800">No admin notifications</p>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                New campaign submissions, KYC reviews, and platform alerts will appear here.
              </p>
            </div>
          ) : (
            <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100">
              {notifications.map((item) => {
                const isUnread = !item.readAt;
                const message =
                  item.payload?.message ??
                  item.payload?.campaignName ??
                  item.type.replace(/_/g, " ");

                return (
                  <div
                    key={item.id}
                    className={`group relative p-3.5 transition-colors flex items-start gap-3 ${
                      isUnread ? "bg-blue-50/40 hover:bg-blue-50/70" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center shrink-0 mt-0.5">
                      {getNotificationIcon(item.type)}
                    </div>

                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => {
                        if (isUnread) markReadMutation.mutate(item.id);
                      }}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[11px] font-bold text-slate-800 capitalize truncate">
                          {item.type.replace(/_/g, " ")}
                        </span>
                        {isUnread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0364FF] shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {message}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {formatTimestamp(item.createdAt || item.sentAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      {isUnread && (
                        <button
                          type="button"
                          onClick={() => markReadMutation.mutate(item.id)}
                          title="Mark as read"
                          className="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-[#0364FF] hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteMutation.mutate(item.id)}
                        title="Delete"
                        className="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[11px] text-slate-400">
            <span>{notifications.length} notification{notifications.length !== 1 ? "s" : ""}</span>
            <span className="text-[10px] text-slate-400">Live feed</span>
          </div>
        </div>
      )}
    </div>
  );
}
