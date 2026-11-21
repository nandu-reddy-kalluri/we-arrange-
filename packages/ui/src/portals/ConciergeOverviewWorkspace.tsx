"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Inbox,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import {
  conciergeApi,
  extractArray,
  type BackendEnquiryStatus,
  type BookingStatusName,
  type ConciergeAnalyticsDTO,
  type ConciergeBookingRow,
  type ConciergeLeadRow,
  type ConciergeWorkspaceSummaryDTO,
} from "@we-arrange/api-client";

const BOOKING_STATUSES: BookingStatusName[] = [
  "Pending",
  "Confirmed",
  "In Progress",
  "Completed",
  "Cancelled",
  "Refunded",
];

export function ConciergeOverviewWorkspace({ basePath = "/concierge-portal" }: { basePath?: string }) {
  const [summary, setSummary] = useState<ConciergeWorkspaceSummaryDTO | null>(null);
  const [analytics, setAnalytics] = useState<ConciergeAnalyticsDTO | null>(null);
  const [leads, setLeads] = useState<ConciergeLeadRow[]>([]);
  const [bookings, setBookings] = useState<ConciergeBookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    const [sumRes, anaRes, leadsRes, bookingsRes] = await Promise.all([
      conciergeApi.getWorkspaceSummary(),
      conciergeApi.getAnalytics(),
      conciergeApi.listLeads({ limit: 8 }),
      conciergeApi.listBookings(),
    ]);

    if (sumRes.ok && sumRes.data) setSummary(sumRes.data);
    if (anaRes.ok && anaRes.data) setAnalytics(anaRes.data);
    if (leadsRes.ok) setLeads(extractArray<ConciergeLeadRow>(leadsRes.data));
    if (bookingsRes.ok) setBookings(extractArray<ConciergeBookingRow>(bookingsRes.data));
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  const handleQuickLeadStatus = async (enquiryId: number, status: BackendEnquiryStatus) => {
    const res = await conciergeApi.updateEnquiryStatus(enquiryId, { status });
    if (!res.ok) {
      showToast(res.error || "Failed to update enquiry status.");
      return;
    }
    showToast(`Enquiry #${enquiryId} marked ${status}.`);
    await loadWorkspace();
  };

  const handleBookingStatus = async (bookingId: number, statusName: BookingStatusName) => {
    const res = await conciergeApi.updateBookingStatus(bookingId, { statusName });
    if (!res.ok) {
      showToast(res.error || "Failed to update booking status.");
      return;
    }
    showToast(`Booking #${bookingId} updated to ${statusName}.`);
    await loadWorkspace();
  };

  if (loading && !summary && !analytics) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3 text-neutral-500">
        <Loader2 className="w-6 h-6 animate-spin text-[#8B263E]" />
        <span className="text-xs font-semibold uppercase tracking-widest">
          Loading concierge workspace...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#8B263E] text-white px-5 py-3 rounded-2xl shadow-xl border border-[#C8A165]/40 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#C8A165]" />
          <span>{toast}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E0D8] pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C8A165]">
            Concierge Operations
          </span>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-neutral-900 tracking-tight mt-0.5">
            Live Hospitality Workspace
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void loadWorkspace()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-[#E5E0D8] bg-white text-neutral-700 hover:bg-[#FAF5ED]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <a
            href={`${basePath}/leads`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#8B263E] hover:bg-[#721f33] shadow-sm"
          >
            <span>Open Leads Desk</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E5E0D8] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2 text-neutral-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending Leads</span>
            <Inbox className="w-4 h-4 text-[#8B263E]" />
          </div>
          <div className="font-serif font-bold text-3xl text-neutral-900">
            {summary?.pendingLeads ?? analytics?.unassignedOrPendingCount ?? 0}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            {summary?.activeLeads ?? 0} active negotiations
          </p>
        </div>

        <div className="bg-white border border-[#E5E0D8] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2 text-neutral-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Assigned To Me</span>
            <ClipboardList className="w-4 h-4 text-[#C8A165]" />
          </div>
          <div className="font-serif font-bold text-3xl text-neutral-900">
            {summary?.assignedToMe ?? analytics?.assignedEnquiriesCount ?? 0}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            {summary?.quotesCollectedByMe ?? analytics?.quotesCollectedCount ?? 0} quotes collected
          </p>
        </div>

        <div className="bg-white border border-[#E5E0D8] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2 text-neutral-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Open Site Visits</span>
            <CalendarClock className="w-4 h-4 text-[#8B263E]" />
          </div>
          <div className="font-serif font-bold text-3xl text-neutral-900">
            {summary?.openSiteVisits ?? analytics?.scheduledSiteVisitsCount ?? 0}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Requested or scheduled</p>
        </div>

        <div className="bg-white border border-[#E5E0D8] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2 text-neutral-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Platform Bookings</span>
            <Sparkles className="w-4 h-4 text-[#C8A165]" />
          </div>
          <div className="font-serif font-bold text-3xl text-neutral-900">
            {analytics?.platformBookingsCount ?? bookings.length}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            {analytics?.quotesApprovedCount ?? 0} approved quotes
          </p>
        </div>
      </div>

      {/* Recent Enquiries */}
      <div className="bg-white border border-[#E5E0D8] rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif font-bold text-xl text-neutral-900">Recent Concierge Leads</h2>
            <p className="text-xs text-neutral-500">Live enquiries from Supabase</p>
          </div>
          <a
            href={`${basePath}/leads`}
            className="text-xs font-bold text-[#8B263E] hover:underline"
          >
            Manage All
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px] text-xs">
            <thead>
              <tr className="border-b border-[#E5E0D8] text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                <th className="pb-3">Enquiry</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Site Visit</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Quick Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {leads.map((lead) => (
                <tr key={lead.enquiry_id} className="hover:bg-[#FAF9F6]/60">
                  <td className="py-3.5">
                    <div className="font-bold text-neutral-900">
                      #{lead.enquiry_id} — {lead.subject || "Wedding Enquiry"}
                    </div>
                    <div className="text-[11px] text-neutral-500 line-clamp-1">
                      {lead.message || "No notes provided"}
                    </div>
                  </td>
                  <td className="py-3.5 text-neutral-700">
                    <div className="font-semibold">{lead.customer?.full_name || "Customer"}</div>
                    <div className="text-[11px] text-neutral-400">
                      {lead.customer?.phone || lead.customer?.email || "—"}
                    </div>
                  </td>
                  <td className="py-3.5 text-neutral-600">{lead.site_visit_status || "None"}</td>
                  <td className="py-3.5">
                    <span className="px-2.5 py-1 rounded-full bg-[#FAF5ED] text-[#8B263E] font-bold text-[11px]">
                      {lead.status || "Pending"}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <select
                      value={lead.status || "Pending"}
                      onChange={(e) =>
                        void handleQuickLeadStatus(
                          lead.enquiry_id,
                          e.target.value as BackendEnquiryStatus
                        )
                      }
                      className="text-xs border border-[#E5E0D8] rounded-lg px-2 py-1 bg-white font-semibold"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Active">Active</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-neutral-400">
                    No concierge enquiries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white border border-[#E5E0D8] rounded-3xl p-6 shadow-sm space-y-4">
        <div>
          <h2 className="font-serif font-bold text-xl text-neutral-900">Active Bookings</h2>
          <p className="text-xs text-neutral-500">Update milestone booking statuses directly</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px] text-xs">
            <thead>
              <tr className="border-b border-[#E5E0D8] text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                <th className="pb-3">Booking</th>
                <th className="pb-3">Event Date</th>
                <th className="pb-3">Amount (INR)</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {bookings.slice(0, 8).map((b) => (
                <tr key={b.booking_id} className="hover:bg-[#FAF9F6]/60">
                  <td className="py-3.5 font-bold text-neutral-900">
                    Booking #{b.booking_id}
                    {b.quote_id ? ` (Quote #${b.quote_id})` : ""}
                  </td>
                  <td className="py-3.5 text-neutral-600">{b.event_date || "TBD"}</td>
                  <td className="py-3.5 font-semibold text-neutral-800">
                    {(() => {
                      const amount = b.total_amount ?? b.total_amount_inr;
                      return amount !== null && amount !== undefined && !Number.isNaN(Number(amount))
                        ? `₹${Number(amount).toLocaleString("en-IN")}`
                        : "—";
                    })()}
                  </td>
                  <td className="py-3.5">
                    <span className="px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-800 font-bold text-[11px]">
                      {b.status_name || "Pending"}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <select
                      value={(b.status_name as BookingStatusName) || "Pending"}
                      onChange={(e) =>
                        void handleBookingStatus(b.booking_id, e.target.value as BookingStatusName)
                      }
                      className="text-xs border border-[#E5E0D8] rounded-lg px-2 py-1 bg-white font-semibold"
                    >
                      {BOOKING_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-neutral-400">
                    No platform bookings recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
