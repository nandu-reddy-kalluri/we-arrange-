"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  ExternalLink,
  Edit3,
  Clock,
  Layers,
  Sparkles,
} from "lucide-react";
import { adminDataService, AdminPageRecord } from "@/services/admin/adminDataService";

export default function AdminPagesListPage() {
  const [pages, setPages] = useState<AdminPageRecord[]>([]);

  useEffect(() => {
    async function load() {
      const data = await adminDataService.getPages();
      setPages(data);
    }
    load();
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-[#E5E0D8] pb-6">
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C8A165]">
          CMS &amp; Visual Editor
        </span>
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-neutral-900 tracking-tight mt-0.5">
          Pages Content Manager
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          Manage live headlines, hero banners, trust strips, concierge steps, and SEO metadata across all pages.
        </p>
      </div>

      {/* Pages Directory Table */}
      <div className="bg-white border border-[#E5E0D8] rounded-3xl p-6 shadow-sm">
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-[#E5E0D8] text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                <th className="pb-3">Page Title</th>
                <th className="pb-3">Route URL</th>
                <th className="pb-3">Section Count</th>
                <th className="pb-3">Last Updated</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {pages.map((page) => (
                <tr key={page.slug} className="hover:bg-[#FAF9F6]/60 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#FAF5ED] border border-[#C8A165]/30 flex items-center justify-center text-[#8B263E]">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-neutral-900 text-sm">
                          {page.title}
                        </span>
                        <span className="text-[10px] uppercase font-semibold text-[#C8A165]">
                          Active Production Template
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-4">
                    <span className="font-mono text-xs text-[#8B263E] bg-[#FAF5ED] px-2.5 py-1 rounded-lg">
                      {page.routeUrl}
                    </span>
                  </td>

                  <td className="py-4">
                    <div className="flex items-center gap-1.5 text-neutral-600 font-medium">
                      <Layers className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{page.sectionCount} Editable Blocks</span>
                    </div>
                  </td>

                  <td className="py-4 text-neutral-500 font-medium">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-neutral-400" />
                      <span>{page.lastUpdated}</span>
                    </div>
                  </td>

                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={page.routeUrl}
                        target="_blank"
                        className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                        title="Preview Live Page"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>

                      <Link
                        href={`/concierge-portal/pages/${page.slug}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#8B263E] hover:bg-[#721f33] text-white font-bold text-xs shadow-sm transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Content</span>
                      </Link>
                    </div>
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
