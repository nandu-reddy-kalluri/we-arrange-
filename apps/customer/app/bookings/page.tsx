"use client";

import React from "react";
import Link from "next/link";
import { CalendarCheck, Clock, Sparkles } from "lucide-react";

export default function CustomerBookingsPage() {
  return (
    <div>
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B263E]/10 text-[#8B263E] text-[10px] font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3 h-3" />
          <span>Concierge Concierge Orders</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#2D2D2D] font-bold">
          My Bookings & Quotes
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Track verified venue site visits, vendor bookings, and concierge quotations in one place.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#8B263E]/10 p-8 md:p-14 text-center max-w-xl mx-auto shadow-sm my-8">
        <div className="w-16 h-16 rounded-full bg-[#FAF9F6] flex items-center justify-center mx-auto mb-4 text-[#8B263E]">
          <CalendarCheck className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#2D2D2D] mb-2">
          No active bookings yet
        </h2>
        <p className="text-neutral-600 text-xs md:text-sm mb-6 leading-relaxed max-w-md mx-auto">
          When you request quote negotiations or site visits through the WeArrange Concierge, your live confirmations and bookings will appear here.
        </p>
        <Link
          href="/saved"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#8B263E] hover:bg-[#701E31] text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
        >
          <span>View Saved Shortlist</span>
        </Link>
      </div>
    </div>
  );
}
