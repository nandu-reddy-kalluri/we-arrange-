"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Store,
  Image as ImageIcon,
  ArrowRight,
  Heart,
  Calendar,
  Sparkles,
  CalendarCheck,
} from "lucide-react";
import { useAuth } from "@we-arrange/auth";
import { useSavedStore } from "../../store/useSavedStore";

export default function CustomerOverviewPage() {
  const { user } = useAuth();
  const { savedVenueIds, savedVendorIds } = useSavedStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.user_metadata?.display_name ||
    user?.email?.split("@")[0] ||
    "User";

  const venueCount = mounted ? savedVenueIds.length : 0;
  const vendorCount = mounted ? savedVendorIds.length : 0;
  const totalSaved = venueCount + vendorCount;

  return (
    <div>
      {/* HEADER */}
      <div className="mb-8 lg:mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B263E]/10 text-[#8B263E] text-[10px] font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3 h-3" />
          <span>Member Concierge</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#2D2D2D] font-bold leading-tight">
          Welcome back, {userName}
        </h1>
        <p className="mt-2 text-sm lg:text-base text-neutral-500">
          Manage your wedding journey, curated shortlist, and verified recommendations in Hyderabad.
        </p>
      </div>

      {/* MY WEDDING CARDS */}
      <div className="mb-10">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 mb-4">
          My Wedding Discoveries
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-5">
          {/* VENUES */}
          <Link
            href="/saved"
            className="group bg-white rounded-2xl border border-[#8B263E]/10 p-5 lg:p-6 hover:shadow-lg hover:border-[#8B263E]/20 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-[#F5EEE7] flex items-center justify-center group-hover:scale-105 transition-transform">
                <MapPin className="w-5 h-5 text-[#8B263E]" />
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-[#8B263E] group-hover:translate-x-1 transition-all" />
            </div>
            <p className="mt-5 text-3xl font-serif text-[#2D2D2D] font-bold">
              {venueCount}
            </p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Venues Saved
              </p>
              <span className="text-[11px] text-[#8B263E] font-medium group-hover:underline">
                View Shortlist →
              </span>
            </div>
          </Link>

          {/* VENDORS */}
          <Link
            href="/saved"
            className="group bg-white rounded-2xl border border-[#8B263E]/10 p-5 lg:p-6 hover:shadow-lg hover:border-[#8B263E]/20 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-[#F5EEE7] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Store className="w-5 h-5 text-[#8B263E]" />
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-[#8B263E] group-hover:translate-x-1 transition-all" />
            </div>
            <p className="mt-5 text-3xl font-serif text-[#2D2D2D] font-bold">
              {vendorCount}
            </p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Vendors Saved
              </p>
              <span className="text-[11px] text-[#8B263E] font-medium group-hover:underline">
                View Shortlist →
              </span>
            </div>
          </Link>

          {/* BOOKINGS */}
          <Link
            href="/bookings"
            className="group bg-white rounded-2xl border border-[#8B263E]/10 p-5 lg:p-6 hover:shadow-lg hover:border-[#8B263E]/20 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-[#F5EEE7] flex items-center justify-center group-hover:scale-105 transition-transform">
                <CalendarCheck className="w-5 h-5 text-[#8B263E]" />
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-[#8B263E] group-hover:translate-x-1 transition-all" />
            </div>
            <p className="mt-5 text-3xl font-serif text-[#2D2D2D] font-bold">
              0
            </p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Active Bookings
              </p>
              <span className="text-[11px] text-[#8B263E] font-medium group-hover:underline">
                View Status →
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* RECENTLY SAVED SHORTLIST SUMMARY */}
      <div className="mb-10">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 mb-4">
          Recently Saved Activity
        </h2>

        <div className="bg-white rounded-2xl border border-[#8B263E]/10 p-8">
          {totalSaved > 0 ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-lg text-[#2D2D2D] font-bold">
                  You have {totalSaved} item{totalSaved > 1 ? "s" : ""} saved in your shortlist
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  {venueCount} venue{venueCount === 1 ? "" : "s"} and {vendorCount} vendor{vendorCount === 1 ? "" : "s"} ready for quotation review.
                </p>
              </div>
              <Link
                href="/saved"
                className="px-6 py-2.5 rounded-full bg-[#8B263E] hover:bg-[#701E31] text-white text-xs font-semibold uppercase tracking-wider transition-colors shrink-0"
              >
                View Shortlist →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-6">
              <div className="w-12 h-12 rounded-full bg-[#F5EEE7] flex items-center justify-center mb-3">
                <Heart className="w-5 h-5 text-[#8B263E]" />
              </div>
              <h3 className="font-serif text-base text-[#2D2D2D] font-semibold">
                No saved items yet
              </h3>
              <p className="mt-1 text-xs text-neutral-500 max-w-sm">
                Browse elite venues and vendors in Hyderabad and tap the heart icon to save them to your personal shortlist.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
