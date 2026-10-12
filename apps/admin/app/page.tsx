import React from "react";
import Link from "next/link";
import { ShieldCheck, Users, Building2, BarChart3, Settings } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] p-6 lg:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between pb-6 border-b border-[#8B263E]/10 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-[#8B263E]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5A880]">
                Platform Administration
              </span>
            </div>
            <h1 className="text-3xl font-serif font-bold text-[#2D2D2D]">
              WeArrange Central Admin
            </h1>
          </div>
          <Link
            href="http://localhost:3004"
            className="px-5 py-2.5 rounded-full bg-[#8B263E] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#701E31] transition-colors"
          >
            Open Concierge Console →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
            <Users className="w-8 h-8 text-[#8B263E] mb-3" />
            <h3 className="font-serif text-lg font-bold text-[#2D2D2D]">User Governance</h3>
            <p className="text-xs text-neutral-500 mt-1">Manage customer accounts, roles, and administrative permissions.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
            <Building2 className="w-8 h-8 text-[#8B263E] mb-3" />
            <h3 className="font-serif text-lg font-bold text-[#2D2D2D]">Catalog Moderation</h3>
            <p className="text-xs text-neutral-500 mt-1">Audit and verify Hyderabad venues, vendors, and pricing authenticity.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
            <BarChart3 className="w-8 h-8 text-[#8B263E] mb-3" />
            <h3 className="font-serif text-lg font-bold text-[#2D2D2D]">Platform Analytics</h3>
            <p className="text-xs text-neutral-500 mt-1">Track customer acquisition, quote conversion rates, and revenue metrics.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
