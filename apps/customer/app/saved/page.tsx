"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, Building2, Sparkles, Trash2, MapPin, Star } from "lucide-react";
import { useSavedStore } from "../../store/useSavedStore";
import { featuredVenues } from "@we-arrange/database";
import { mockVendors } from "@we-arrange/database";
import type { Venue, Vendor } from "@we-arrange/types";

type ActiveTab = "all" | "venues" | "vendors";

export default function CustomerSavedPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("all");
  const [isMounted, setIsMounted] = useState(false);

  const { savedVenueIds, savedVendorIds, removeSavedVenue, removeSavedVendor } = useSavedStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
    <div>
      {/* ── BACK BUTTON ── */}
      <div className="mb-6">
        <Link
          href="/overview"
          className="inline-flex items-center gap-2 text-xs md:text-sm font-semibold text-neutral-600 hover:text-[#8B263E] transition-colors py-1.5 px-3 -ml-3 rounded-lg hover:bg-[#F5EEE7] w-fit cursor-pointer"
          aria-label="Back to Dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#8B263E]/10">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#C6934A]">
              Personal Shortlist
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C6934A]" />
            <span className="text-[11px] font-bold text-neutral-500">
              {isMounted ? `${totalSavedCount} ${totalSavedCount === 1 ? "Item" : "Items"} Saved` : "Loading..."}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#2D2D2D] tracking-tight">
            Saved Shortlist
          </h1>
          <p className="mt-2 text-sm md:text-base text-neutral-600 max-w-2xl font-light">
            Your saved venues and vendors in one place. Compare, plan, and connect seamlessly.
          </p>
        </div>
      </div>

      {/* ── CATEGORY TABS ── */}
      <div className="mt-8 flex items-center gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs md:text-sm font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
            activeTab === "all"
              ? "bg-[#8B263E] text-white shadow-md shadow-[#8B263E]/20"
              : "bg-white text-neutral-700 hover:text-[#8B263E] hover:bg-neutral-50 border border-neutral-200"
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${activeTab === "all" ? "fill-white text-white" : "text-[#8B263E]"}`} />
          <span>All Saved</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === "all" ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-700"
            }`}
          >
            {isMounted ? totalSavedCount : 0}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("venues")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs md:text-sm font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
            activeTab === "venues"
              ? "bg-[#8B263E] text-white shadow-md shadow-[#8B263E]/20"
              : "bg-white text-neutral-700 hover:text-[#8B263E] hover:bg-neutral-50 border border-neutral-200"
          }`}
        >
          <span>🏛️</span>
          <span>Venues</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === "venues" ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-700"
            }`}
          >
            {isMounted ? savedVenues.length : 0}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("vendors")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs md:text-sm font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
            activeTab === "vendors"
              ? "bg-[#8B263E] text-white shadow-md shadow-[#8B263E]/20"
              : "bg-white text-neutral-700 hover:text-[#8B263E] hover:bg-neutral-50 border border-neutral-200"
          }`}
        >
          <span>💐</span>
          <span>Vendors</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === "vendors" ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-700"
            }`}
          >
            {isMounted ? savedVendors.length : 0}
          </span>
        </button>
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="mt-8">
        {!isMounted ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#8B263E] border-t-transparent animate-spin" />
            <span className="text-xs font-bold text-neutral-500">Loading saved items...</span>
          </div>
        ) : totalSavedCount === 0 ? (
          /* Overall Empty State */
          <div className="bg-white rounded-3xl border border-[#8B263E]/10 p-8 md:p-14 text-center max-w-xl mx-auto shadow-sm my-8">
            <div className="w-16 h-16 rounded-full bg-[#8B263E]/10 flex items-center justify-center mx-auto mb-5 text-[#8B263E]">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#2D2D2D] mb-2.5">
              No Saved Items Yet
            </h2>
            <p className="text-neutral-600 text-sm md:text-base mb-8 leading-relaxed">
              Browse venues and vendors to add them to your curated shortlist for effortless comparison and planning.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* VENUES */}
            {(activeTab === "all" || activeTab === "venues") && (
              <section>
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-neutral-200">
                  <h2 className="font-serif text-xl font-bold text-[#2D2D2D] flex items-center gap-2">
                    <span>🏛️ Saved Venues</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#8B263E]/10 text-[#8B263E]">
                      {savedVenues.length}
                    </span>
                  </h2>
                </div>

                {savedVenues.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {savedVenues.map((venue) => (
                      <div
                        key={venue.id}
                        className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
                      >
                        <div className="relative h-48 w-full bg-neutral-100 overflow-hidden">
                          <img
                            src={venue.imageUrl}
                            alt={venue.name}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeSavedVenue(venue.id)}
                            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-red-600 hover:bg-white shadow transition-transform hover:scale-105 cursor-pointer"
                            title="Remove from saved"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-1">
                              <MapPin className="w-3.5 h-3.5 text-[#8B263E]" />
                              <span>{venue.location}, {venue.city}</span>
                            </div>
                            <h3 className="font-serif text-lg font-bold text-[#2D2D2D]">
                              {venue.name}
                            </h3>
                            <p className="text-xs text-neutral-600 mt-1">
                              Capacity: {venue.capacityRange}
                            </p>
                          </div>
                          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                            <span className="text-xs font-bold text-[#8B263E]">
                              {venue.priceOnwards}
                            </span>
                            <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                              <span>{venue.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-500 italic py-4">No saved venues yet.</p>
                )}
              </section>
            )}

            {/* VENDORS */}
            {(activeTab === "all" || activeTab === "vendors") && (
              <section>
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-neutral-200">
                  <h2 className="font-serif text-xl font-bold text-[#2D2D2D] flex items-center gap-2">
                    <span>💐 Saved Vendors</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#8B263E]/10 text-[#8B263E]">
                      {savedVendors.length}
                    </span>
                  </h2>
                </div>

                {savedVendors.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {savedVendors.map((vendor) => (
                      <div
                        key={vendor.id}
                        className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
                      >
                        <div className="relative h-48 w-full bg-neutral-100 overflow-hidden">
                          <img
                            src={vendor.imageUrl}
                            alt={vendor.name}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeSavedVendor(vendor.id)}
                            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-red-600 hover:bg-white shadow transition-transform hover:scale-105 cursor-pointer"
                            title="Remove from saved"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-1">
                              <MapPin className="w-3.5 h-3.5 text-[#8B263E]" />
                              <span>{vendor.location}</span>
                            </div>
                            <h3 className="font-serif text-lg font-bold text-[#2D2D2D]">
                              {vendor.name}
                            </h3>
                            <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider text-[#C8A165]">
                              {vendor.category}
                            </span>
                          </div>
                          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                            <span className="text-xs font-bold text-[#8B263E]">
                              Starting ₹{vendor.priceStart}L
                            </span>
                            <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                              <span>{vendor.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-500 italic py-4">No saved vendors yet.</p>
                )}
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
