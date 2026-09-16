"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, Building2, Sparkles, ExternalLink, Compass } from "lucide-react";
import { useSavedStore } from "@/store/useSavedStore";
import { featuredVenues, Venue } from "@/mock-data/venues";
import { mockVendors, Vendor } from "@/mock-data/vendors";
import VenueCard from "@/components/cards/VenueCard";
import VendorCard from "@/components/cards/VendorCard";

type ActiveTab = "all" | "venues" | "vendors";

export default function SavedClient() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("all");
  const [isMounted, setIsMounted] = useState(false);

  const { savedVenueIds, savedVendorIds, removeSavedVenue, removeSavedVendor } = useSavedStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filter saved items from mock data
  const savedVenues = useMemo<Venue[]>(() => {
    if (!isMounted) return [];
    return featuredVenues.filter((venue) => savedVenueIds.includes(venue.id));
  }, [savedVenueIds, isMounted]);

  const savedVendors = useMemo<Vendor[]>(() => {
    if (!isMounted) return [];
    return mockVendors.filter((vendor) => savedVendorIds.includes(vendor.id));
  }, [savedVendorIds, isMounted]);

  const totalSavedCount = savedVenues.length + savedVendors.length;

  return (
    <main className="min-h-screen bg-[#FAF9F6] text-[#2D2D2D] pt-24 md:pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ── BACK BUTTON ── */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs md:text-sm font-semibold text-neutral-600 hover:text-[#8B263E] transition-colors py-1.5 px-3 -ml-3 rounded-lg hover:bg-neutral-100 w-fit"
            aria-label="Back to Home"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* ── HEADER ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-neutral-200">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-[#C6934A]">
                Personal Shortlist
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#C6934A]" />
              <span className="text-[11px] font-bold text-neutral-500">
                {isMounted ? `${totalSavedCount} ${totalSavedCount === 1 ? 'Item' : 'Items'} Saved` : 'Loading...'}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[#2D2D2D] tracking-tight">
              Saved Items
            </h1>
            <p className="mt-2 text-sm md:text-base text-neutral-600 max-w-2xl font-light">
              Your curated collection of dream wedding venues and elite vendors in Hyderabad. Compare, plan, and connect seamlessly.
            </p>
          </div>

          {/* Quick Explore Links */}
          <div className="flex items-center gap-2 self-start md:self-end">
            <Link
              href="/venues"
              className="text-xs font-bold text-neutral-700 hover:text-[#8B263E] px-3.5 py-2 rounded-full bg-white border border-neutral-200 hover:border-[#8B263E]/40 transition-colors shadow-sm"
            >
              Explore Venues
            </Link>
            <Link
              href="/vendors"
              className="text-xs font-bold text-neutral-700 hover:text-[#8B263E] px-3.5 py-2 rounded-full bg-white border border-neutral-200 hover:border-[#8B263E]/40 transition-colors shadow-sm"
            >
              Explore Vendors
            </Link>
          </div>
        </div>

        {/* ── CATEGORY TABS ── */}
        <div className="mt-8 flex items-center gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs md:text-sm font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
              activeTab === "all"
                ? "bg-[#8B263E] text-white shadow-md shadow-[#8B263E]/20"
                : "bg-white text-neutral-700 hover:text-[#8B263E] hover:bg-neutral-50 border border-neutral-200"
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${activeTab === "all" ? "fill-white text-white" : "text-[#8B263E]"}`} />
            <span>All Saved</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === "all" ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-700"
            }`}>
              {isMounted ? totalSavedCount : 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("venues")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs md:text-sm font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
              activeTab === "venues"
                ? "bg-[#8B263E] text-white shadow-md shadow-[#8B263E]/20"
                : "bg-white text-neutral-700 hover:text-[#8B263E] hover:bg-neutral-50 border border-neutral-200"
            }`}
          >
            <span>🏛️</span>
            <span>Venues</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === "venues" ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-700"
            }`}>
              {isMounted ? savedVenues.length : 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("vendors")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs md:text-sm font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
              activeTab === "vendors"
                ? "bg-[#8B263E] text-white shadow-md shadow-[#8B263E]/20"
                : "bg-white text-neutral-700 hover:text-[#8B263E] hover:bg-neutral-50 border border-neutral-200"
            }`}
          >
            <span>💐</span>
            <span>Vendors</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === "vendors" ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-700"
            }`}>
              {isMounted ? savedVendors.length : 0}
            </span>
          </button>
        </div>

        {/* ── TAB CONTENT ── */}
        <div className="mt-8">
          {/* Loading state before hydration */}
          {!isMounted ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#8B263E] border-t-transparent animate-spin" />
              <span className="text-xs font-bold text-neutral-500">Loading saved items...</span>
            </div>
          ) : totalSavedCount === 0 ? (
            /* Overall Empty State */
            <div className="bg-white rounded-3xl border border-neutral-200/80 p-8 md:p-14 text-center max-w-xl mx-auto shadow-sm my-8">
              <div className="w-16 h-16 rounded-full bg-[#8B263E]/10 flex items-center justify-center mx-auto mb-5 text-[#8B263E]">
                <Heart className="w-8 h-8" />
              </div>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#2D2D2D] mb-2.5">
                No Saved Items Yet
              </h2>
              <p className="text-neutral-600 text-sm md:text-base mb-8 leading-relaxed">
                Click the heart icon on any venue or vendor card to add them to your saved collection for effortless comparison and planning.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/venues"
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#8B263E] hover:bg-[#6e1c2f] text-white text-xs font-black uppercase tracking-wider transition-all shadow-md text-center"
                >
                  Explore Venues
                </Link>
                <Link
                  href="/vendors"
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200 text-xs font-bold uppercase tracking-wider transition-all shadow-sm text-center"
                >
                  Explore Vendors
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* ── TAB: ALL SAVED ── */}
              {activeTab === "all" && (
                <div className="space-y-14">
                  {/* Venues Section */}
                  {savedVenues.length > 0 && (
                    <section>
                      <div className="flex items-center justify-between mb-6 pb-3 border-b border-neutral-200">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">🏛️</span>
                          <h2 className="font-serif text-xl md:text-2xl font-bold text-[#2D2D2D]">
                            Saved Venues
                          </h2>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#8B263E]/10 text-[#8B263E]">
                            {savedVenues.length}
                          </span>
                        </div>
                        <Link
                          href="/venues"
                          className="text-xs font-bold text-[#8B263E] hover:underline flex items-center gap-1"
                        >
                          Browse More Venues →
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {savedVenues.map((venue) => (
                          <VenueCard
                            key={venue.id}
                            venue={venue}
                            onRemove={() => removeSavedVenue(venue.id)}
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Vendors Section */}
                  {savedVendors.length > 0 && (
                    <section>
                      <div className="flex items-center justify-between mb-6 pb-3 border-b border-neutral-200">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">💐</span>
                          <h2 className="font-serif text-xl md:text-2xl font-bold text-[#2D2D2D]">
                            Saved Vendors
                          </h2>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#8B263E]/10 text-[#8B263E]">
                            {savedVendors.length}
                          </span>
                        </div>
                        <Link
                          href="/vendors"
                          className="text-xs font-bold text-[#8B263E] hover:underline flex items-center gap-1"
                        >
                          Browse More Vendors →
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {savedVendors.map((vendor) => (
                          <VendorCard
                            key={vendor.id}
                            vendor={vendor}
                            onRemove={() => removeSavedVendor(vendor.id)}
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Gentle suggestion if only one category is saved */}
                  {savedVenues.length === 0 && savedVendors.length > 0 && (
                    <div className="bg-white rounded-2xl border border-dashed border-neutral-300 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3 text-center sm:text-left">
                        <div className="w-10 h-10 rounded-full bg-[#C6934A]/10 text-[#C6934A] flex items-center justify-center shrink-0">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[#2D2D2D]">Looking for a Wedding Venue?</h3>
                          <p className="text-xs text-neutral-600">Explore banquet halls, royal palaces, and resorts across Hyderabad.</p>
                        </div>
                      </div>
                      <Link
                        href="/venues"
                        className="px-4 py-2 rounded-full text-xs font-bold text-white bg-[#8B263E] hover:bg-[#6e1c2f] transition-colors whitespace-nowrap"
                      >
                        Explore Venues
                      </Link>
                    </div>
                  )}

                  {savedVendors.length === 0 && savedVenues.length > 0 && (
                    <div className="bg-white rounded-2xl border border-dashed border-neutral-300 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3 text-center sm:text-left">
                        <div className="w-10 h-10 rounded-full bg-[#C6934A]/10 text-[#C6934A] flex items-center justify-center shrink-0">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[#2D2D2D]">Complete Your Wedding Team</h3>
                          <p className="text-xs text-neutral-600">Discover elite photographers, decorators, makeup artists, and caterers.</p>
                        </div>
                      </div>
                      <Link
                        href="/vendors"
                        className="px-4 py-2 rounded-full text-xs font-bold text-white bg-[#8B263E] hover:bg-[#6e1c2f] transition-colors whitespace-nowrap"
                      >
                        Explore Vendors
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB: VENUES ONLY ── */}
              {activeTab === "venues" && (
                <div>
                  {savedVenues.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                      {savedVenues.map((venue) => (
                        <VenueCard
                          key={venue.id}
                          venue={venue}
                          onRemove={() => removeSavedVenue(venue.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-3xl border border-neutral-200/80 p-8 md:p-14 text-center max-w-lg mx-auto shadow-sm my-6">
                      <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4 text-neutral-500 text-2xl">
                        🏛️
                      </div>
                      <h3 className="font-serif text-xl font-bold text-[#2D2D2D] mb-2">
                        No Saved Venues Yet
                      </h3>
                      <p className="text-neutral-600 text-xs md:text-sm mb-6 leading-relaxed">
                        You haven&apos;t saved any wedding venues yet. Browse our hand-picked collection of Hyderabad&apos;s finest banquets, resorts, and heritage palaces.
                      </p>
                      <Link
                        href="/venues"
                        className="inline-block px-6 py-2.5 rounded-full bg-[#8B263E] hover:bg-[#6e1c2f] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md"
                      >
                        Explore Venues
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB: VENDORS ONLY ── */}
              {activeTab === "vendors" && (
                <div>
                  {savedVendors.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                      {savedVendors.map((vendor) => (
                        <VendorCard
                          key={vendor.id}
                          vendor={vendor}
                          onRemove={() => removeSavedVendor(vendor.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-3xl border border-neutral-200/80 p-8 md:p-14 text-center max-w-lg mx-auto shadow-sm my-6">
                      <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4 text-neutral-500 text-2xl">
                        💐
                      </div>
                      <h3 className="font-serif text-xl font-bold text-[#2D2D2D] mb-2">
                        No Saved Vendors Yet
                      </h3>
                      <p className="text-neutral-600 text-xs md:text-sm mb-6 leading-relaxed">
                        You haven&apos;t saved any wedding vendors yet. Explore premier photographers, decorators, bridal makeup artists, and caterers.
                      </p>
                      <Link
                        href="/vendors"
                        className="inline-block px-6 py-2.5 rounded-full bg-[#8B263E] hover:bg-[#6e1c2f] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md"
                      >
                        Explore Vendors
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
