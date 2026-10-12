"use client";

import React, { useState, useMemo } from "react";
import {
  BarChart3,
  Users,
  Clock,
  Smartphone,
  Monitor,
  Search,
  ArrowUpDown,
  Filter,
  TrendingUp,
} from "lucide-react";
import { adminDataService } from "@/services/admin/adminDataService";

export default function AdminAnalyticsPage() {
  const analytics = adminDataService.getAnalytics();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const categories = useMemo(() => {
    const list = ["All"];
    analytics.pageUsageTable.forEach((item) => {
      if (!list.includes(item.category)) list.push(item.category);
    });
    return list;
  }, [analytics.pageUsageTable]);

  const filteredPages = useMemo(() => {
    return analytics.pageUsageTable.filter((page) => {
      const matchSearch =
        page.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat =
        categoryFilter === "All" || page.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [analytics.pageUsageTable, searchQuery, categoryFilter]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-[#E5E0D8] pb-6">
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C8A165]">
          Traffic &amp; Behavior Intelligence
        </span>
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-neutral-900 tracking-tight mt-0.5">
          Analytics Overview
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          Detailed metrics, user sessions, device distribution, and individual page performances.
        </p>
      </div>

      {/* 4 Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Visits */}
        <div className="bg-white border border-[#E5E0D8] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Total Visits
            </span>
            <div className="p-2 rounded-xl bg-[#FAF5ED] text-[#8B263E]">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif font-bold text-2xl sm:text-3xl text-neutral-900">
            {analytics.totalVisits}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            +22.3% this month
          </p>
        </div>

        {/* Unique Users */}
        <div className="bg-white border border-[#E5E0D8] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Unique Users
            </span>
            <div className="p-2 rounded-xl bg-[#FAF5ED] text-[#C8A165]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif font-bold text-2xl sm:text-3xl text-neutral-900">
            {analytics.uniqueUsers}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            72% first-time wedding planners
          </p>
        </div>

        {/* Average Dwell Time */}
        <div className="bg-white border border-[#E5E0D8] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Avg Dwell Time
            </span>
            <div className="p-2 rounded-xl bg-[#FAF5ED] text-[#8B263E]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="font-serif font-bold text-2xl sm:text-3xl text-neutral-900">
            {analytics.avgDwellTime}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            High intent &amp; engagement
          </p>
        </div>

        {/* Mobile vs Desktop breakdown */}
        <div className="bg-white border border-[#E5E0D8] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Device Breakdown
            </span>
            <div className="p-2 rounded-xl bg-[#FAF5ED] text-[#C8A165]">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-serif font-bold text-lg text-neutral-900">
              <Smartphone className="w-4 h-4 text-[#8B263E]" />
              <span>{analytics.mobilePercent}%</span>
            </div>
            <span className="text-neutral-300">/</span>
            <div className="flex items-center gap-1.5 font-serif font-bold text-lg text-neutral-600">
              <Monitor className="w-4 h-4 text-[#C8A165]" />
              <span>{analytics.desktopPercent}%</span>
            </div>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            Mobile-optimized design primary
          </p>
        </div>
      </div>

      {/* Page Usage Table with Search & Filter */}
      <div className="bg-white border border-[#E5E0D8] rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif font-bold text-xl text-neutral-900">
              Page Usage &amp; Route Performance
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Comparative traffic breakdown across all user-facing sections.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search route or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-[#8B263E]"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl px-3 py-2 font-semibold text-neutral-700 focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "All" ? "All Categories" : c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-[#E5E0D8] text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                <th className="pb-3">Route Path</th>
                <th className="pb-3">Page Category</th>
                <th className="pb-3">Page Views</th>
                <th className="pb-3">Average Time</th>
                <th className="pb-3 text-right">Bounce Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {filteredPages.map((page) => (
                <tr key={page.route} className="hover:bg-[#FAF9F6]/60 transition-colors">
                  <td className="py-4 font-mono font-semibold text-[#8B263E]">
                    {page.route}
                  </td>
                  <td className="py-4">
                    <span className="px-2.5 py-1 rounded-lg bg-[#FAF5ED] text-neutral-700 font-medium text-[11px]">
                      {page.category}
                    </span>
                  </td>
                  <td className="py-4 font-bold text-neutral-900">
                    {page.views}
                  </td>
                  <td className="py-4 text-neutral-600 font-medium">
                    {page.avgTime}
                  </td>
                  <td className="py-4 text-right font-semibold text-neutral-700">
                    {page.bounceRate}
                  </td>
                </tr>
              ))}
              {filteredPages.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-neutral-400 font-medium">
                    No matching routes found.
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
