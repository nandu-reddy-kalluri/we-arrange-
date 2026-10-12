import React from "react";
import Link from "next/link";
import { Store, MessageSquare, Calendar, Star, TrendingUp } from "lucide-react";

export default function VendorDashboardPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] p-6 lg:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between pb-6 border-b border-[#8B263E]/10 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Store className="w-5 h-5 text-[#8B263E]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5A880]">
                Vendor Workspace
              </span>
            </div>
            <h1 className="text-3xl font-serif font-bold text-[#2D2D2D]">
              Vendor Business Console
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Manage your services, enquiries, site visits, and quotes in Hyderabad.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-neutral-200">
            <span className="text-xs text-neutral-500 font-medium">New Enquiries</span>
            <p className="text-2xl font-serif font-bold text-[#2D2D2D] mt-2">0</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-neutral-200">
            <span className="text-xs text-neutral-500 font-medium">Pending Quotes</span>
            <p className="text-2xl font-serif font-bold text-[#2D2D2D] mt-2">0</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-neutral-200">
            <span className="text-xs text-neutral-500 font-medium">Confirmed Bookings</span>
            <p className="text-2xl font-serif font-bold text-[#2D2D2D] mt-2">0</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-neutral-200">
            <span className="text-xs text-neutral-500 font-medium">Profile Rating</span>
            <p className="text-2xl font-serif font-bold text-[#8B263E] mt-2">5.0 ★</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center max-w-lg mx-auto my-8">
          <MessageSquare className="w-12 h-12 text-[#8B263E] mx-auto mb-3" />
          <h2 className="font-serif text-xl font-bold text-[#2D2D2D]">
            Welcome to the Vendor Console
          </h2>
          <p className="text-xs text-neutral-600 mt-2 mb-6">
            Verified vendor profiles receive direct quotation requests from WeArrange concierge and self-planning couples.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-2.5 rounded-full bg-[#8B263E] text-white text-xs font-semibold uppercase tracking-wider"
          >
            Visit Public Website
          </a>
        </div>
      </div>
    </div>
  );
}
