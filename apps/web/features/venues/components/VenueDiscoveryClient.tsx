"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { VenueHeroSearch, VenueFilterState } from "./VenueHeroSearch";
import { QuickExperienceCards } from "./QuickExperienceCards";
import { PremiumVenueGrid } from "./PremiumVenueGrid";
import type { Venue } from "@/mock-data/venues";
import { fetchPaginatedVenues } from "@/services/catalog/catalogApi";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const INITIAL_FILTERS: VenueFilterState = {
  location: "Any Location",
  guests: "Any Guests",
  budget: "Any Budget",
  venueType: "All Types",
  space: "All Spaces",
};

function parseCapacityBounds(guests: string): { minCapacity?: number; maxCapacity?: number } {
  if (!guests || guests.startsWith("Any")) return {};
  if (guests.includes("50–100") || guests.includes("50-100")) return { minCapacity: 50, maxCapacity: 150 };
  if (guests.includes("100–200") || guests.includes("100-200")) return { minCapacity: 100, maxCapacity: 250 };
  if (guests.includes("200–500") || guests.includes("200-500")) return { minCapacity: 200, maxCapacity: 500 };
  if (guests.includes("500–1000") || guests.includes("500-1000")) return { minCapacity: 500, maxCapacity: 1000 };
  if (guests.includes("1000+")) return { minCapacity: 1000 };
  const parsed = parseInt(guests.replace(/\D/g, ""), 10);
  return !Number.isNaN(parsed) && parsed > 0 ? { minCapacity: parsed } : {};
}

export function VenueDiscoveryClient() {
  const [mounted, setMounted] = useState(false);
  const [filters, setFilters] = useState<VenueFilterState>(INITIAL_FILTERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [venues, setVenues] = useState<Venue[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState<"relevance" | "rating" | "reviews" | "capacity" | "newest">("relevance");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qParam = params.get("q") || params.get("search") || "";
    const locationParam = params.get("location") || params.get("city") || params.get("locality");
    const guestsParam = params.get("guests");
    const budgetParam = params.get("budget");
    const typeParam = params.get("venueType") || params.get("type");
    const spaceParam = params.get("space");

    if (qParam) {
      setSearchQuery(qParam);
      setDebouncedSearch(qParam.trim());
    }
    if (locationParam || guestsParam || budgetParam || typeParam || spaceParam) {
      setFilters((prev) => ({
        ...prev,
        location: locationParam || prev.location,
        guests: guestsParam || prev.guests,
        budget: budgetParam || prev.budget,
        venueType: typeParam || prev.venueType,
        space: spaceParam || prev.space,
      }));
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

function parseBudgetParams(budget: string): {
  minPlatePrice?: number;
  maxPlatePrice?: number;
  priceOnRequestOnly?: boolean;
} {
  if (!budget || budget.startsWith("Any")) return {};
  if (budget === "Price on Request") return { priceOnRequestOnly: true };
  if (budget === "₹500 per plate") return { maxPlatePrice: 500 };
  if (budget === "₹1,000 per plate") return { maxPlatePrice: 1000 };
  if (budget === "₹1,500 per plate") return { maxPlatePrice: 1500 };
  if (budget === "₹2,000 per plate") return { maxPlatePrice: 2000 };
  if (budget === "₹2,500 per plate") return { maxPlatePrice: 2500 };
  if (budget === "₹3,000+ per plate") return { minPlatePrice: 3000 };
  return {};
}

  const fetchCurrentVenues = useCallback(async () => {
    const { minCapacity, maxCapacity } = parseCapacityBounds(filters.guests);
    const { minPlatePrice, maxPlatePrice, priceOnRequestOnly } = parseBudgetParams(filters.budget);
    const hasLocation =
      filters.location && !filters.location.startsWith("All") && !filters.location.startsWith("Any");
    const locTrimmed = filters.location.trim();
    const isHyderabadCity =
      locTrimmed.toLowerCase() === "hyderabad" || locTrimmed.toLowerCase() === "hyderabad city";
    const hasType =
      filters.venueType && !filters.venueType.startsWith("All") && !filters.venueType.startsWith("Any");
    const hasSpace =
      filters.space && !filters.space.startsWith("All") && !filters.space.startsWith("Any");

    return fetchPaginatedVenues({
      page,
      limit: 20,
      q: debouncedSearch || undefined,
      city: hasLocation && isHyderabadCity ? "Hyderabad" : undefined,
      locality: hasLocation && !isHyderabadCity ? locTrimmed : undefined,
      type: hasType ? filters.venueType : undefined,
      space: hasSpace ? filters.space : undefined,
      minCapacity,
      maxCapacity,
      minPlatePrice,
      maxPlatePrice,
      priceOnRequestOnly,
      sortBy,
    });
  }, [
    debouncedSearch,
    filters.location,
    filters.guests,
    filters.budget,
    filters.venueType,
    filters.space,
    page,
    sortBy,
  ]);

  useEffect(() => {
    if (!mounted) return;
    let active = true;
    setIsLoading(true);
    setError(null);

    void fetchCurrentVenues().then((res) => {
      if (!active) return;
      if (res.error) {
        setError(res.error);
        setVenues([]);
        setTotalCount(0);
        setTotalPages(1);
      } else {
        setVenues(res.items);
        setTotalCount(res.meta.total);
        setTotalPages(Math.max(1, res.meta.totalPages));
      }
      setIsLoading(false);
    });

    return () => {
      active = false;
    };
  }, [mounted, fetchCurrentVenues, reloadTick]);

  const handleFilterChange = (key: keyof VenueFilterState, value: string) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setPage(1);
    setSortBy("relevance");
    setSearchQuery("");
    setDebouncedSearch("");
    setFilters(INITIAL_FILTERS);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (filters.location && !filters.location.startsWith("All") && !filters.location.startsWith("Any")) count++;
    if (filters.guests && !filters.guests.startsWith("Any")) count++;
    if (filters.budget && !filters.budget.startsWith("Any")) count++;
    if (filters.venueType && !filters.venueType.startsWith("All") && !filters.venueType.startsWith("Any")) count++;
    if (filters.space && !filters.space.startsWith("All") && !filters.space.startsWith("Any")) count++;
    return count;
  }, [filters, searchQuery]);

  const filteredVenues = venues;

  const handleScrollToGrid = () => {
    const el = document.getElementById("venue-grid");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF7F2] relative pb-28">
      
      {/* 1. Hero Header & Unified Search */}
      <section className="pt-28 pb-12 md:pt-36 md:pb-16 px-4 sm:px-6 max-w-6xl mx-auto relative z-40">
        
        {/* Header Typography */}
        <div className="text-center mb-8 md:mb-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#C5A880]/30 shadow-sm mb-4"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.25em] text-[#8B263E]">
              Curated Spaces • Hyderabad
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif font-light text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight tracking-tight mb-4 text-neutral-900"
          >
            Discover Your <span className="font-semibold text-[#C5A880]">Dream Venue</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm md:text-base text-neutral-600 font-medium max-w-xl mx-auto leading-relaxed"
          >
            Experience a new standard of luxury wedding planning. Find the perfect venue and get the best quotations seamlessly.
          </motion.p>
        </div>

        {/* Hero Search & Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative z-50"
        >
          <VenueHeroSearch
            filters={filters}
            onFilterChange={handleFilterChange}
            onSearch={handleScrollToGrid}
            onReset={handleResetFilters}
            activeFilterCount={activeFilterCount}
          />
        </motion.div>

      </section>

      {/* 2. Quick Experience Cards */}
      <section className="mb-12">
        <QuickExperienceCards />
      </section>

      {/* 3. Filtered Venue Grid */}
      <PremiumVenueGrid
        venues={filteredVenues}
        totalCount={totalCount}
        activeFilterCount={activeFilterCount}
        onReset={handleResetFilters}
        isLoading={isLoading}
        error={error}
        onRetry={() => setReloadTick((t) => t + 1)}
        page={page}
        totalPages={totalPages}
        onPageChange={(nextPage) => {
          setPage(nextPage);
          handleScrollToGrid();
        }}
        sortBy={sortBy}
        onSortChange={(nextSort) => {
          setPage(1);
          setSortBy(nextSort);
        }}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setPage(1);
          setSearchQuery(q);
        }}
      />

    </div>
  );
}
