"use client";

import React, { useCallback, useEffect, useState } from "react";
import { apiClient } from "@we-arrange/api-client";
import { Bell, CalendarCheck, CheckCheck, MessageSquare, RefreshCw, AlertCircle } from "lucide-react";
import { Skeleton } from "../Skeleton";

export interface NotificationItem {
  notification_id: number;
  title: string;
  message: string;
  notification_type: string | null;
  is_read: boolean | null;
  created_at: string | null;
}

export interface CustomerSummaryCounts {
  enquiriesCount: number;
  bookingsCount: number;
  unreadNotificationsCount: number;
  preferredCity?: string | null;
  weddingDate?: string | null;
  fullName?: string | null;
}

interface CustomerProfileSummary {
  fullName?: string | null;
  preferences?: {
    preferredCity?: string | null;
    weddingDate?: string | null;
  } | null;
}

export interface CustomerOverviewNotificationsProps {
  onSummaryLoaded?: (summary: CustomerSummaryCounts) => void;
  bookingsHref?: string;
  settingsHref?: string;
}

export function CustomerOverviewNotifications({
  onSummaryLoaded,
  bookingsHref = "/customer/bookings",
  settingsHref = "/customer/settings",
}: CustomerOverviewNotificationsProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<number | "all" | null>(null);
  const [notifFilter, setNotifFilter] = useState<"all" | "unread">("all");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [summary, setSummary] = useState<CustomerSummaryCounts>({
    enquiriesCount: 0,
    bookingsCount: 0,
    unreadNotificationsCount: 0,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [profileRes, enquiriesRes, bookingsRes, notifRes] = await Promise.all([
      apiClient.get<CustomerProfileSummary>("/api/customer/profile", { retryOn401: false }),
      apiClient.get<Array<{ enquiry_id: number }>>("/api/enquiries", {
        query: { limit: 20 },
        retryOn401: false,
      }),
      apiClient.get<Array<{ booking_id: number }>>("/api/bookings", {
        query: { limit: 20 },
        retryOn401: false,
      }),
      apiClient.get<NotificationItem[]>("/api/notifications", {
        query: { limit: 15 },
        retryOn401: false,
      }),
    ]);

    if (notifRes.status === 401 && bookingsRes.status === 401) {
      setError("Sign in to load your live bookings, enquiries, and concierge notifications.");
      setLoading(false);
      return;
    }

    const notifList = Array.isArray(notifRes.data) ? notifRes.data : [];
    const bookingsMetaTotal =
      typeof bookingsRes.meta?.total === "number"
        ? bookingsRes.meta.total
        : Array.isArray(bookingsRes.data)
          ? bookingsRes.data.length
          : 0;
    const enquiriesMetaTotal =
      typeof enquiriesRes.meta?.total === "number"
        ? enquiriesRes.meta.total
        : Array.isArray(enquiriesRes.data)
          ? enquiriesRes.data.length
          : 0;
    const unreadCount = notifList.filter((n) => !n.is_read).length;

    const nextSummary: CustomerSummaryCounts = {
      enquiriesCount: enquiriesMetaTotal,
      bookingsCount: bookingsMetaTotal,
      unreadNotificationsCount: unreadCount,
      preferredCity: profileRes.data?.preferences?.preferredCity ?? null,
      weddingDate: profileRes.data?.preferences?.weddingDate ?? null,
      fullName: profileRes.data?.fullName ?? null,
    };

    setNotifications(notifList);
    setSummary(nextSummary);
    onSummaryLoaded?.(nextSummary);

    if (!notifRes.ok && notifRes.error) {
      setError(notifRes.error);
    }
    setLoading(false);
  }, [onSummaryLoaded]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleMarkRead = async (notificationId?: number) => {
    setMarkingId(notificationId ?? "all");
    const payload = notificationId
      ? { notificationIds: [notificationId] }
      : { markAll: true };

    const res = await apiClient.patch<{ updatedCount?: number }>(
      "/api/notifications/read",
      payload
    );

    if (res.ok) {
      setNotifications((prev) =>
        prev.map((item) =>
          !notificationId || item.notification_id === notificationId
            ? { ...item, is_read: true }
            : item
        )
      );
      setSummary((prev) => {
        const updatedCount = notificationId
          ? Math.max(0, prev.unreadNotificationsCount - 1)
          : 0;
        const next = { ...prev, unreadNotificationsCount: updatedCount };
        onSummaryLoaded?.(next);
        return next;
      });
    } else if (res.error) {
      setError(res.error);
    }
    setMarkingId(null);
  };

  return (
    <div className="space-y-6">
      {/* LIVE WORKSPACE METRICS STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <a
          href={bookingsHref}
          className="bg-white rounded-2xl border border-[#8B263E]/10 p-5 hover:shadow-md hover:border-[#8B263E]/25 transition-all flex items-center justify-between"
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Concierge Enquiries
            </p>
            <div className="mt-1 text-2xl font-serif font-bold text-[#2D2D2D]">
              {loading ? <Skeleton className="h-7 w-10 mt-1" /> : summary.enquiriesCount}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#F5EEE7] flex items-center justify-center text-[#8B263E]">
            <MessageSquare className="w-5 h-5" />
          </div>
        </a>

        <a
          href={bookingsHref}
          className="bg-white rounded-2xl border border-[#8B263E]/10 p-5 hover:shadow-md hover:border-[#8B263E]/25 transition-all flex items-center justify-between"
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Verified Bookings
            </p>
            <div className="mt-1 text-2xl font-serif font-bold text-[#2D2D2D]">
              {loading ? <Skeleton className="h-7 w-10 mt-1" /> : summary.bookingsCount}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#F5EEE7] flex items-center justify-center text-[#8B263E]">
            <CalendarCheck className="w-5 h-5" />
          </div>
        </a>

        <a
          href={settingsHref}
          className="bg-white rounded-2xl border border-[#8B263E]/10 p-5 hover:shadow-md hover:border-[#8B263E]/25 transition-all flex items-center justify-between"
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              Wedding Target
            </p>
            <p className="mt-1 text-sm font-semibold text-[#2D2D2D] truncate max-w-[180px]">
              {loading
                ? "…"
                : summary.weddingDate || summary.preferredCity
                  ? [summary.preferredCity, summary.weddingDate].filter(Boolean).join(" • ")
                  : "Set preferences →"}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-[#C6934A]/15 text-[#8B263E] text-[10px] font-bold uppercase">
            Profile
          </span>
        </a>
      </div>

      {/* NOTIFICATIONS PANEL */}
      <div className="bg-white rounded-2xl border border-[#8B263E]/10 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#F5EEE7] flex items-center justify-center text-[#8B263E]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-[#2D2D2D]">
                Notifications & Alerts
              </h3>
              <p className="text-xs text-neutral-500">
                {summary.unreadNotificationsCount} unread update
                {summary.unreadNotificationsCount === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {notifications.length > 0 && (
              <div className="inline-flex rounded-full bg-[#FAF7F3] p-0.5 border border-[#8B263E]/10 text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setNotifFilter("all")}
                  className={`px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                    notifFilter === "all" ? "bg-white text-[#8B263E] shadow-xs" : "text-neutral-500"
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setNotifFilter("unread")}
                  className={`px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                    notifFilter === "unread" ? "bg-white text-[#8B263E] shadow-xs" : "text-neutral-500"
                  }`}
                >
                  Unread
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => void loadData()}
              disabled={loading}
              className="px-3 py-1.5 rounded-full border border-neutral-200 text-xs font-semibold text-neutral-600 hover:text-[#8B263E] hover:border-[#8B263E]/30 inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>

            {summary.unreadNotificationsCount > 0 && (
              <button
                type="button"
                onClick={() => void handleMarkRead()}
                disabled={markingId === "all"}
                className="px-3.5 py-1.5 rounded-full bg-[#8B263E] text-white text-xs font-semibold hover:bg-[#701E31] inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>{markingId === "all" ? "Updating..." : "Mark all read"}</span>
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="space-y-3 py-2" aria-label="Loading live notifications">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-[#FAF7F3] space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-full max-w-md" />
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-6 px-4 text-center text-xs text-neutral-500 bg-[#FAF7F3] rounded-xl border border-dashed border-[#8B263E]/15">
            You have no concierge notifications yet. Updates on quotes, site visits, and bookings will appear here.
          </div>
        ) : (
          (() => {
            const visibleNotifications =
              notifFilter === "unread" ? notifications.filter((n) => !n.is_read) : notifications;
            if (visibleNotifications.length === 0) {
              return (
                <div className="py-6 px-4 text-center text-xs text-neutral-500 bg-[#FAF7F3] rounded-xl border border-dashed border-[#8B263E]/15">
                  All caught up! No unread concierge notifications remaining.
                </div>
              );
            }
            return (
          <div className="divide-y divide-neutral-100">
            {visibleNotifications.map((item) => {
              const unread = !item.is_read;
              return (
                <div
                  key={item.notification_id}
                  className={`py-3 flex items-start justify-between gap-4 ${
                    unread ? "bg-[#F5EEE7]/40 -mx-3 px-3 rounded-xl" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {unread && (
                        <span className="w-2 h-2 rounded-full bg-[#8B263E] shrink-0" />
                      )}
                      <p className="text-sm font-semibold text-[#2D2D2D] truncate">
                        {item.title}
                      </p>
                      {item.notification_type && (
                        <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-[10px] font-semibold uppercase">
                          {item.notification_type}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-600 mt-1">{item.message}</p>
                    {item.created_at && (
                      <p className="text-[11px] text-neutral-400 mt-1">
                        {new Date(item.created_at).toLocaleString()}
                      </p>
                    )}
                  </div>

                  {unread && (
                    <button
                      type="button"
                      onClick={() => void handleMarkRead(item.notification_id)}
                      disabled={markingId === item.notification_id}
                      className="shrink-0 text-xs font-semibold text-[#8B263E] hover:underline cursor-pointer disabled:opacity-50"
                    >
                      {markingId === item.notification_id ? "Saving..." : "Mark read"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
            );
          })()
        )}
      </div>
    </div>
  );
}
