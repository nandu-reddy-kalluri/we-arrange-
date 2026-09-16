"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Eye,
  Smartphone,
  Inbox,
  Building2,
  TrendingUp,
  ArrowUpRight,
  Clock,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { adminDataService, AdminLead } from "@/services/admin/adminDataService";

export default function AdminDashboardPage() {
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [statusToast, setStatusToast] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const allLeads = await adminDataService.getLeads();
      setLeads(allLeads);
      setAnalytics(adminDataService.getAnalytics());
    }
    loadData();
  }, []);

  const handleQuickStatusChange = async (leadId: string, newStatus: AdminLead["status"]) => {
    const res = await adminDataService.updateLeadStatus(leadId, newStatus);
    const updated = await adminDataService.getLeads();
    setLeads(updated);

    setStatusToast(res.message);
    setTimeout(() => setStatusToast(null), 3000);
  };

  if (!analytics) {
    return (
      <div className="py-12 text-center text-neutral-400 font-medium">
        Loading executive dashboard...
      </div>
    );
  }

  const urgentLeads = leads.slice(0, 4);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Toast Notification */}
      {statusToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#8B263E] text-white px-5 py-3 rounded-2xl shadow-xl border border-[#C8A165]/40 text-xs font-bold flex items-center gap-2 animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-[#C8A165]" />
          <span>{statusToast}</span>
        </div>
      )}

      {/* Header & Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E0D8] pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C8A165]">
            Executive Overview
          </span>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-neutral-900 tracking-tight mt-0.5">
            Good morning! Here is today&apos;s overview.
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/concierge-portal/leads"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#8B263E] hover:bg-[#721f33] transition-all shadow-sm"
          >
            <span>View All Inquiries</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* KPI 1: Total Views Today */}
        <div className="bg-white border border-[#E5E0D8] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-neutral-500 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Total Views Today
            </span>
            <div className="p-2 rounded-xl bg-[#FAF5ED] text-[#8B263E]">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif font-bold text-2xl sm:text-3xl text-neutral-900">
              {analytics.todayViews}
            </span>
            <span className="text-xs font-semibold text-emerald-600">
              +18.4%
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Across all public portals</p>
        </div>

        {/* KPI 2: Mobile Traffic % */}
        <div className="bg-white border border-[#E5E0D8] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-neutral-500 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Mobile Traffic %
            </span>
            <div className="p-2 rounded-xl bg-[#FAF5ED] text-[#C8A165]">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif font-bold text-2xl sm:text-3xl text-neutral-900">
              {analytics.mobilePercent}%
            </span>
            <span className="text-xs font-medium text-neutral-500">
              (Desktop: {analytics.desktopPercent}%)
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Smartphones &amp; tablets dominant</p>
        </div>

        {/* KPI 3: New Inquiries */}
        <div className="bg-white border border-[#E5E0D8] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-neutral-500 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              New Inquiries
            </span>
            <div className="p-2 rounded-xl bg-[#FAF5ED] text-[#8B263E]">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif font-bold text-2xl sm:text-3xl text-[#8B263E]">
              {analytics.newInquiriesToday}
            </span>
            <span className="text-xs font-semibold text-emerald-600">
              +4 pending review
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">High-budget wedding concierge</p>
        </div>

        {/* KPI 4: Active Venues / Vendors */}
        <div className="bg-white border border-[#E5E0D8] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-neutral-500 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Active Venues &amp; Vendors
            </span>
            <div className="p-2 rounded-xl bg-[#FAF5ED] text-[#C8A165]">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif font-bold text-2xl sm:text-3xl text-neutral-900">
              {analytics.activeVenuesCount + analytics.activeVendorsCount}
            </span>
            <span className="text-xs font-medium text-neutral-500">
              ({analytics.activeVenuesCount}V / {analytics.activeVendorsCount}Ven)
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">100% verified partners</p>
        </div>
      </div>

      {/* Main Grid: Weekly Trend & Urgent Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Traffic Trend (7-Day Visual Bar Chart) */}
        <div className="lg:col-span-2 bg-white border border-[#E5E0D8] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C8A165]">
                Audience Growth
              </span>
              <h2 className="font-serif font-bold text-lg text-neutral-900">
                Weekly Traffic Trend (Visits)
              </h2>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 bg-[#FAF9F6] px-3 py-1.5 rounded-xl border border-[#E5E0D8]">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Past 7 Days</span>
            </div>
          </div>

          {/* Bar Chart Representation */}
          <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2">
            {analytics.weeklyTrend.map((item: any, idx: number) => {
              const maxVisits = 7000;
              const heightPercent = Math.round((item.visits / maxVisits) * 100);
              const isPeak = item.visits >= 5800;

              return (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-bold text-neutral-400 group-hover:text-neutral-800 transition-colors opacity-0 group-hover:opacity-100">
                    {item.visits}
                  </span>
                  <div className="w-full bg-[#FAF5ED] rounded-xl overflow-hidden h-36 flex items-end p-1">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-lg transition-all duration-500 ${
                        isPeak
                          ? "bg-gradient-to-t from-[#8B263E] to-[#C8A165]"
                          : "bg-[#C8A165]/60 hover:bg-[#8B263E]/80"
                      }`}
                    />
                  </div>
                  <span className="text-xs font-semibold text-neutral-600">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <span>Weekend traffic spikes ~85% due to wedding date inquiries</span>
            <Link
              href="/concierge-portal/analytics"
              className="font-bold text-[#8B263E] hover:underline inline-flex items-center gap-1"
            >
              <span>Full Analytics</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Top 3 Visited Pages */}
        <div className="bg-white border border-[#E5E0D8] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C8A165]">
              High Engagement
            </span>
            <h2 className="font-serif font-bold text-lg text-neutral-900 mb-4">
              Top 3 Visited Pages
            </h2>

            <div className="space-y-3.5">
              {analytics.topPages.map((page: any, index: number) => (
                <div
                  key={page.route}
                  className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#E5E0D8]/80 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-xl bg-white border border-[#E5E0D8] flex items-center justify-center font-bold text-xs text-[#8B263E]">
                      {index + 1}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-neutral-800 font-mono">
                        {page.route}
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        {page.views} views
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
                    {page.change}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-100">
            <Link
              href="/concierge-portal/pages"
              className="w-full py-2.5 px-4 rounded-xl bg-[#FAF5ED] hover:bg-[#F3ECE1] text-[#8B263E] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Manage Page Content</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Urgent Leads / Recent Leads Section */}
      <div className="bg-white border border-[#E5E0D8] rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C8A165]">
              Real-time Inquiries
            </span>
            <h2 className="font-serif font-bold text-lg sm:text-xl text-neutral-900">
              Urgent Leads &amp; Recent Inquiries
            </h2>
          </div>

          <Link
            href="/concierge-portal/leads"
            className="text-xs font-bold text-[#8B263E] hover:underline inline-flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All Leads ({leads.length})</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Responsive Table / Cards */}
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-[#E5E0D8] text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                <th className="pb-3 font-semibold">Couple / Lead</th>
                <th className="pb-3 font-semibold">Guests &amp; Budget</th>
                <th className="pb-3 font-semibold">Location &amp; Venue</th>
                <th className="pb-3 font-semibold">Current Status</th>
                <th className="pb-3 font-semibold text-right">Quick Status Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {urgentLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-[#FAF9F6]/60 transition-colors">
                  <td className="py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-neutral-900">
                        {lead.coupleName}
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        {lead.ceremony}
                      </span>
                    </div>
                  </td>

                  <td className="py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-neutral-800">
                        {lead.guests}
                      </span>
                      <span className="text-[11px] text-[#8B263E] font-medium">
                        {lead.budget}
                      </span>
                    </div>
                  </td>

                  <td className="py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-neutral-800 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#C8A165]" />
                        <span>{lead.city}</span>
                      </span>
                      <span className="text-[11px] text-neutral-500 truncate max-w-[180px]">
                        {lead.venueInquired}
                      </span>
                    </div>
                  </td>

                  <td className="py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        lead.status === "New"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : lead.status === "Contacted"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : lead.status === "Negotiating"
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : lead.status === "Quote Sent"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : lead.status === "Won / Closed"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {lead.status}
                    </span>
                  </td>

                  <td className="py-4 text-right">
                    <select
                      value={lead.status}
                      onChange={(e) =>
                        handleQuickStatusChange(
                          lead.id,
                          e.target.value as AdminLead["status"]
                        )
                      }
                      className="text-xs bg-white border border-[#E5E0D8] rounded-xl px-2.5 py-1 font-semibold text-neutral-700 focus:outline-none focus:ring-1 focus:ring-[#8B263E]"
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Negotiating">Negotiating</option>
                      <option value="Quote Sent">Quote Sent</option>
                      <option value="Won / Closed">Won / Closed</option>
                      <option value="Lost">Lost</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
