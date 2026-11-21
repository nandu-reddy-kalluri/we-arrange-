"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, Trash2, MapPin, Star, Building2, Store } from "lucide-react";
import { apiClient } from "@we-arrange/api-client";
import { CardSkeleton, CustomerCollectionsPanel, ShortlistQuoteBanner } from "@we-arrange/ui";
import { useSavedStore } from "../../store/useSavedStore";

type ActiveTab = "all" | "venues" | "vendors";

interface SavedVenueItem {
  id: string;
  slug: string;
  name: string;
  location: string;
  city: string;
  capacityRange: string;
  priceOnwards: string;
  rating: number | null;
  imageUrl: string;
}

interface SavedVendorItem {
  id: string;
  slug: string;
  name: string;
  category: string;
  location: string;
  priceLabel: string;
  rating: number | null;
  imageUrl: string;
}

const PUBLIC_WEB_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/+$/, "");

const DEFAULT_VENUE_IMAGE = "/images/placeholders/venue.svg";
const DEFAULT_VENDOR_IMAGE = "/images/placeholders/photography.svg";

function mapVenuePayload(raw: Record<string, unknown>): SavedVenueItem | null {
  const row =
    raw.venue && typeof raw.venue === "object" && !Array.isArray(raw.venue)
      ? (raw.venue as Record<string, unknown>)
      : raw;
  const id = String(row.venue_id ?? "");
  const slug = String(row.slug ?? id);
  if (!id || !slug) return null;

  const gallery = Array.isArray(raw.gallery)
    ? raw.gallery
    : Array.isArray(row.gallery)
      ? row.gallery
      : [];
  const firstImg = gallery
    .map((m) =>
      typeof m === "string"
        ? m
        : String((m as Record<string, unknown>).media_url ?? (m as Record<string, unknown>).url ?? "")
    )
    .find(Boolean);

  const pricing = Array.isArray(raw.pricing) ? raw.pricing[0] as Record<string, unknown> | undefined : undefined;
  const starting = Number(pricing?.starting_price ?? 0);
  const priceTag =
    (typeof pricing?.price_tag === "string" && pricing.price_tag.trim()) ||
    (starting > 1
      ? `₹${starting >= 100000 ? `${(starting / 100000).toFixed(1).replace(/\.0$/, "")}L` : starting.toLocaleString("en-IN")} Onwards`
      : typeof row.price_range === "string" && row.price_range.trim()
        ? row.price_range.trim()
        : "Price on Request");

  const minCap = Number(row.guest_count_min ?? 0);
  const maxCap = Number(row.guest_count_max ?? 0);
  const capacityRange =
    minCap > 0 && maxCap > 0
      ? `${minCap} - ${Math.max(minCap, maxCap)} Guests`
      : maxCap > 0
        ? `Up to ${maxCap} Guests`
        : "Flexible Capacity";

  const rawRating = Number(row.rating ?? 0);
  return {
    id,
    slug,
    name: String(row.venue_name ?? "Wedding Venue"),
    location: String(row.locality_name ?? row.base_city ?? "Hyderabad"),
    city: String(row.base_city ?? "Hyderabad"),
    capacityRange,
    priceOnwards: priceTag,
    rating: Number.isFinite(rawRating) && rawRating > 0 ? rawRating : null,
    imageUrl: firstImg || DEFAULT_VENUE_IMAGE,
  };
}

function mapVendorPayload(
  raw: Record<string, unknown>,
  catNameById: Map<number, string>
): SavedVendorItem | null {
  const row =
    raw.vendor && typeof raw.vendor === "object" && !Array.isArray(raw.vendor)
      ? (raw.vendor as Record<string, unknown>)
      : raw;
  const id = String(row.vendor_id ?? "");
  const slug = String(row.slug ?? id);
  if (!id || !slug) return null;

  const gallery = Array.isArray(raw.gallery) ? raw.gallery : [];
  const firstImg =
    (typeof row.cover_image === "string" && row.cover_image) ||
    gallery
      .map((m) =>
        typeof m === "string"
          ? m
          : String((m as Record<string, unknown>).media_url ?? (m as Record<string, unknown>).url ?? "")
      )
      .find(Boolean) ||
    DEFAULT_VENDOR_IMAGE;

  const prices = [
    ...(Array.isArray(raw.pricing)
      ? raw.pricing.map((p) => Number((p as Record<string, unknown>)?.price))
      : []),
    ...(Array.isArray(raw.packages)
      ? raw.packages.map((p) => Number((p as Record<string, unknown>)?.price))
      : []),
  ].filter((n) => Number.isFinite(n) && n > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const priceLabel =
    minPrice > 0
      ? minPrice >= 100000
        ? `Starting ₹${(minPrice / 100000).toFixed(1).replace(/\.0$/, "")}L`
        : `Starting ₹${minPrice.toLocaleString("en-IN")}`
      : "Price on Request";

  const rawRating = Number(row.rating ?? 0);
  return {
    id,
    slug,
    name: String(row.vendor_name ?? "Wedding Vendor"),
    category: catNameById.get(Number(row.category_id ?? 0)) ?? "Vendor",
    location: "Hyderabad",
    priceLabel,
    rating: Number.isFinite(rawRating) && rawRating > 0 ? rawRating : null,
    imageUrl: firstImg,
  };
}

export default function CustomerSavedPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("all");
  const [isMounted, setIsMounted] = useState(false);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [savedVenues, setSavedVenues] = useState<SavedVenueItem[]>([]);
  const [savedVendors, setSavedVendors] = useState<SavedVendorItem[]>([]);

  const {
    savedVenueIds,
    savedVendorIds,
    removeSavedVenue,
    removeSavedVendor,
    syncWithServer,
  } = useSavedStore();

  useEffect(() => {
    setIsMounted(true);
    void syncWithServer();
  }, [syncWithServer]);

  useEffect(() => {
    if (!isMounted) return;
    let active = true;

    const numericVenueIds = Array.from(
      new Set(savedVenueIds.filter((id) => /^\d+$/.test(id.trim())))
    );
    const numericVendorIds = Array.from(
      new Set(savedVendorIds.filter((id) => /^\d+$/.test(id.trim())))
    );

    if (numericVenueIds.length === 0 && numericVendorIds.length === 0) {
      setSavedVenues([]);
      setSavedVendors([]);
      setIsLoadingItems(false);
      return;
    }

    setIsLoadingItems(true);
    void (async () => {
      try {
        const catsRes =
          numericVendorIds.length > 0
            ? await apiClient.get<
                Array<{ category_id: number; category_name: string }>
              >("/api/vendors/categories", { retryOn401: false })
            : null;
        const catMap = new Map<number, string>();
        if (catsRes?.ok && Array.isArray(catsRes.data)) {
          catsRes.data.forEach((c) => catMap.set(c.category_id, c.category_name));
        }

        const [venueResList, vendorResList] = await Promise.all([
          Promise.all(
            numericVenueIds.map((id) =>
              apiClient.get<Record<string, unknown>>(
                `/api/venues/${encodeURIComponent(id)}`,
                { retryOn401: false }
              )
            )
          ),
          Promise.all(
            numericVendorIds.map((id) =>
              apiClient.get<Record<string, unknown>>(
                `/api/vendors/${encodeURIComponent(id)}`,
                { retryOn401: false }
              )
            )
          ),
        ]);

        if (!active) return;

        const nextVenues: SavedVenueItem[] = [];
        venueResList.forEach((res) => {
          if (res.ok && res.data) {
            const mapped = mapVenuePayload(res.data);
            if (mapped) nextVenues.push(mapped);
          }
        });

        const nextVendors: SavedVendorItem[] = [];
        vendorResList.forEach((res) => {
          if (res.ok && res.data) {
            const mapped = mapVendorPayload(res.data, catMap);
            if (mapped) nextVendors.push(mapped);
          }
        });

        setSavedVenues(nextVenues);
        setSavedVendors(nextVendors);
      } finally {
        if (active) setIsLoadingItems(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [isMounted, savedVenueIds, savedVendorIds]);

  const totalSavedCount = savedVenues.length + savedVendors.length;
  const showLoader = !isMounted || isLoadingItems;

  return (
    <div>
      {/* BACK BUTTON */}
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

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#8B263E]/10">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#C6934A]">
              Personal Shortlist
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C6934A]" />
            <span className="text-[11px] font-bold text-neutral-500">
              {showLoader
                ? "Loading..."
                : `${totalSavedCount} ${totalSavedCount === 1 ? "Item" : "Items"} Saved`}
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

      {/* CATEGORY TABS */}
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
          <Heart
            className={`w-3.5 h-3.5 ${activeTab === "all" ? "fill-white text-white" : "text-[#8B263E]"}`}
          />
          <span>All Saved</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === "all" ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-700"
            }`}
          >
            {showLoader ? 0 : totalSavedCount}
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
            {showLoader ? 0 : savedVenues.length}
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
            {showLoader ? 0 : savedVendors.length}
          </span>
        </button>
      </div>

      {/* COLLECTIONS & SHORTLIST ENQUIRY */}
      <div className="mt-8 space-y-4">
        <CustomerCollectionsPanel />
        {!showLoader && totalSavedCount > 0 && (
          <ShortlistQuoteBanner
            savedVenueIds={savedVenueIds}
            savedVendorIds={savedVendorIds}
          />
        )}
      </div>

      {/* TAB CONTENT */}
      <div className="mt-8">
        {showLoader ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 py-4" aria-label="Loading saved items">
            {Array.from({ length: 3 }).map((_, idx) => (
              <CardSkeleton key={idx} />
            ))}
          </div>
        ) : totalSavedCount === 0 ? (
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
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`${PUBLIC_WEB_URL}/venues`}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#8B263E] hover:bg-[#701E31] text-white text-xs font-black uppercase tracking-wider transition-all shadow-md text-center"
              >
                Explore Venues
              </a>
              <a
                href={`${PUBLIC_WEB_URL}/vendors`}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200 text-xs font-bold uppercase tracking-wider transition-all shadow-sm text-center"
              >
                Explore Vendors
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* VENUES */}
            {(activeTab === "all" || activeTab === "venues") && (
              <section>
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-neutral-200">
                  <h2 className="font-serif text-xl font-bold text-[#2D2D2D] flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[#8B263E]" aria-hidden="true" />
                    <span>Saved Venues</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#8B263E]/10 text-[#8B263E]">
                      {savedVenues.length}
                    </span>
                  </h2>
                </div>

                {savedVenues.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {savedVenues.map((venue) => (
                      <a
                        key={venue.id}
                        href={`${PUBLIC_WEB_URL}/venues/${venue.slug}`}
                        className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
                      >
                        <div className="relative h-48 w-full bg-neutral-100 overflow-hidden">
                          <img
                            src={venue.imageUrl}
                            alt={venue.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeSavedVenue(venue.id);
                            }}
                            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-red-600 hover:bg-white shadow transition-transform hover:scale-105 cursor-pointer z-10"
                            title="Remove from saved"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-1">
                              <MapPin className="w-3.5 h-3.5 text-[#8B263E]" />
                              <span>
                                {venue.location !== venue.city
                                  ? `${venue.location}, ${venue.city}`
                                  : venue.city}
                              </span>
                            </div>
                            <h3 className="font-serif text-lg font-bold text-[#2D2D2D] group-hover:text-[#8B263E] transition-colors">
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
                            {venue.rating !== null && (
                              <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                <span>{venue.rating.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-500 italic py-4">
                    No saved venues yet.
                  </p>
                )}
              </section>
            )}

            {/* VENDORS */}
            {(activeTab === "all" || activeTab === "vendors") && (
              <section>
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-neutral-200">
                  <h2 className="font-serif text-xl font-bold text-[#2D2D2D] flex items-center gap-2">
                    <Store className="w-5 h-5 text-[#8B263E]" aria-hidden="true" />
                    <span>Saved Vendors</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#8B263E]/10 text-[#8B263E]">
                      {savedVendors.length}
                    </span>
                  </h2>
                </div>

                {savedVendors.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {savedVendors.map((vendor) => (
                      <a
                        key={vendor.id}
                        href={`${PUBLIC_WEB_URL}/vendors/${vendor.slug}`}
                        className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
                      >
                        <div className="relative h-48 w-full bg-neutral-100 overflow-hidden">
                          <img
                            src={vendor.imageUrl}
                            alt={vendor.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeSavedVendor(vendor.id);
                            }}
                            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-red-600 hover:bg-white shadow transition-transform hover:scale-105 cursor-pointer z-10"
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
                            <h3 className="font-serif text-lg font-bold text-[#2D2D2D] group-hover:text-[#8B263E] transition-colors">
                              {vendor.name}
                            </h3>
                            <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider text-[#C8A165]">
                              {vendor.category}
                            </span>
                          </div>
                          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                            <span className="text-xs font-bold text-[#8B263E]">
                              {vendor.priceLabel}
                            </span>
                            {vendor.rating !== null && (
                              <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                <span>{vendor.rating.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-500 italic py-4">
                    No saved vendors yet.
                  </p>
                )}
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
