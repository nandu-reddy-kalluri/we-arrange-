"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  BarChart3,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import {
  conciergeApi,
  type ConciergeAnalyticsDTO,
  type ConciergeWorkspaceSummaryDTO,
} from "@we-arrange/api-client";

export function ConciergeAnalyticsWorkspace() {
  const [analytics, setAnalytics] = useState<ConciergeAnalyticsDTO | null>(null);
  const [summary, setSummary] = useState<ConciergeWorkspaceSummaryDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [anaRes, sumRes] = await Promise.all([
      conciergeApi.getAnalytics(),
      conciergeApi.getWorkspaceSummary(),
    ]);

    if (!anaRes.ok) {
      setError(anaRes.error || "Failed to load concierge analytics.");
    } else {
      setAnalytics(anaRes.data);
    }

    if (sumRes.ok && sumRes.data) {
      setSummary(sumRes.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (loading && !analytics) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3 text-neutral-500">
        <Loader2 className="w-6 h-6 animate-spin text-[#8B263E]" />
        <span className="text-xs font-semibold uppercase tracking-widest">
          Loading concierge analytics...
        </span>
      </div>
    );
  }

  const approvalRate =
    analytics && analytics.quotesCollectedCount > 0
      ? Math.round((analytics.quotesApprovedCount / analytics.quotesCollectedCount) * 100)
      : 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E0D8] pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C8A165]">
            Concierge Funnel &amp; Pipeline
          </span>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-neutral-900 tracking-tight mt-0.5">
            Live Analytics Overview
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Real-time enquiry assignments, site visits, quote conversion, and bookings from Supabase.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadData()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-[#E5E0D8] bg-white text-neutral-700 hover:bg-[#FAF5ED]"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        <div className="bg-white border border-[#E5E0D8] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider">Assigned Enquiries</span>
            <BarChart3 className="w-4 h-4 text-[#8B263E]" />
          </div>
          <div className="font-serif font-bold text-3xl text-neutral-900">
            {analytics?.assignedEnquiriesCount ?? 0}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            {analytics?.unassignedOrPendingCount ?? 0} pending / unassigned leads
          </p>
        </div>

        <div className="bg-white border border-[#E5E0D8] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Scheduled Site Visits
            </span>
            <CalendarClock className="w-4 h-4 text-[#C8A165]" />
          </div>
          <div className="font-serif font-bold text-3xl text-neutral-900">
            {analytics?.scheduledSiteVisitsCount ?? 0}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            {summary?.openSiteVisits ?? 0} currently open across team
          </p>
        </div>

        <div className="bg-white border border-[#E5E0D8] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider">Quotes Collected</span>
            <ClipboardCheck className="w-4 h-4 text-[#8B263E]" />
          </div>
          <div className="font-serif font-bold text-3xl text-neutral-900">
            {analytics?.quotesCollectedCount ?? 0}
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">
            {analytics?.quotesApprovedCount ?? 0} approved ({approvalRate}% conversion)
          </p>
        </div>

        <div className="bg-white border border-[#E5E0D8] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider">Platform Bookings</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-serif font-bold text-3xl text-neutral-900">
            {analytics?.platformBookingsCount ?? 0}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Confirmed &amp; active bookings</p>
        </div>

        <div className="bg-white border border-[#E5E0D8] rounded-2xl p-5 shadow-sm sm:col-span-2">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pipeline Breakdown</span>
            <TrendingUp className="w-4 h-4 text-[#C8A165]" />
          </div>
          <div className="grid grid-cols-3 gap-4 pt-1">
            <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E5E0D8]">
              <div className="text-[10px] font-bold uppercase text-neutral-400">Pending Queue</div>
              <div className="text-xl font-serif font-bold text-neutral-900 mt-1">
                {summary?.pendingLeads ?? 0}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E5E0D8]">
              <div className="text-[10px] font-bold uppercase text-neutral-400">Active Leads</div>
              <div className="text-xl font-serif font-bold text-neutral-900 mt-1">
                {summary?.activeLeads ?? 0}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E5E0D8]">
              <div className="text-[10px] font-bold uppercase text-neutral-400">My Quotes</div>
              <div className="text-xl font-serif font-bold text-neutral-900 mt-1">
                {summary?.quotesCollectedByMe ?? 0}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
