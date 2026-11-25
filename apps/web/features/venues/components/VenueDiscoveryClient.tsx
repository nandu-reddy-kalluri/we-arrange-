"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
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
  theme: "All Themes",
};

const QUICK_THEME_PILLS = [
  { label: "All Venues", type: "all", value: "All Themes" },
  { label: "👑 Royal Heritage", type: "theme", value: "Royal Heritage & Palace" },
  { label: "⭐ Luxury 5-Star", type: "theme", value: "Luxury 5-Star Hotel" },
  { label: "🌿 Scenic Garden", type: "theme", value: "Scenic Garden & Lawn" },
  { label: "🏊 Poolside Resort", type: "theme", value: "Poolside & Resort" },
  { label: "🏛️ Grand Convention", type: "theme", value: "Grand Convention" },
  { label: "🏮 Mandapam", type: "theme", value: "Traditional Mandapam" },
  { label: "💰 Under ₹1,500", type: "budget", value: "₹1,500 per plate" },
  { label: "✨ Price on Request", type: "budget", value: "Price on Request" },
] as const;

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

export function VenueDiscoveryClient({
  initialVenues = [],
  initialTotal = 0,
  initialTotalPages = 1,
}: {
  initialVenues?: Venue[];
  initialTotal?: number;
  initialTotalPages?: number;
} = {}) {
  const [mounted, setMounted] = useState(false);
  const [filters, setFilters] = useState<VenueFilterState>(INITIAL_FILTERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [venues, setVenues] = useState<Venue[]>(initialVenues);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(initialTotal);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [sortBy, setSortBy] = useState<"relevance" | "rating" | "reviews" | "capacity" | "newest">("relevance");
  const [isLoading, setIsLoading] = useState(initialVenues.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);
  const initialSkipRef = useRef(initialVenues.length > 0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qParam = params.get("q") || params.get("search") || "";
    const locationParam = params.get("location") || params.get("city") || params.get("locality");
    const guestsParam = params.get("guests");
    const budgetParam = params.get("budget");
    const typeParam = params.get("venueType") || params.get("type");
    const spaceParam = params.get("space");
    const themeParam = params.get("theme");

    if (qParam) {
      setSearchQuery(qParam);
      setDebouncedSearch(qParam.trim());
    }
    if (locationParam || guestsParam || budgetParam || typeParam || spaceParam || themeParam) {
      setFilters((prev) => ({
        ...prev,
        location: locationParam || prev.location,
        guests: guestsParam || prev.guests,
        budget: budgetParam || prev.budget,
        venueType: typeParam || prev.venueType,
        space: spaceParam || prev.space,
        theme: themeParam || prev.theme,
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
    const hasTheme =
      filters.theme && !filters.theme.startsWith("All") && !filters.theme.startsWith("Any");

    return fetchPaginatedVenues({
      page,
      limit: 20,
      q: debouncedSearch || undefined,
      city: hasLocation && isHyderabadCity ? "Hyderabad" : undefined,
      locality: hasLocation && !isHyderabadCity ? locTrimmed : undefined,
      type: hasType ? filters.venueType : undefined,
      space: hasSpace ? filters.space : undefined,
      theme: hasTheme ? filters.theme : undefined,
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

  const nextPrefetchedRef = useRef<number | null>(null);

  const handlePrefetchNext = useCallback(async () => {
    if (page >= totalPages || nextPrefetchedRef.current === page + 1) return;
    nextPrefetchedRef.current = page + 1;
    try {
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

      const res = await fetchPaginatedVenues({
        page: page + 1,
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

      if (res?.items && Array.isArray(res.items) && typeof window !== "undefined") {
        res.items.slice(0, 8).forEach((v) => {
          if (v.imageUrl) {
            const img = new window.Image();
            img.src = v.imageUrl;
          }
        });
      }
    } catch {
      // Best-effort image prefetch
    }
  }, [page, totalPages, filters, debouncedSearch, sortBy]);

  useEffect(() => {
    if (!mounted) return;
    if (initialSkipRef.current) {
      initialSkipRef.current = false;
      const params = new URLSearchParams(window.location.search);
      const hasCustomParams = Array.from(params.keys()).some((k) =>
        [
          "q",
          "search",
          "location",
          "city",
          "locality",
          "guests",
          "budget",
          "venueType",
          "type",
          "space",
        ].includes(k)
      );
      if (!hasCustomParams) {
        return;
      }
    }
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

  // Sync URL query params with active venue filters
  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (filters.location && !filters.location.startsWith("Any") && !filters.location.startsWith("All")) {
      params.set("location", filters.location);
    }
    if (filters.guests && !filters.guests.startsWith("Any")) {
      params.set("guests", filters.guests);
    }
    if (filters.budget && !filters.budget.startsWith("Any")) {
      params.set("budget", filters.budget);
    }
    if (filters.venueType && !filters.venueType.startsWith("All") && !filters.venueType.startsWith("Any")) {
      params.set("venueType", filters.venueType);
    }
    if (filters.space && !filters.space.startsWith("All") && !filters.space.startsWith("Any")) {
      params.set("space", filters.space);
    }
    if (filters.theme && !filters.theme.startsWith("All") && !filters.theme.startsWith("Any")) {
      params.set("theme", filters.theme);
    }
    if (sortBy && sortBy !== "relevance") {
      params.set("sortBy", sortBy);
    }

    const queryStr = params.toString();
    const newUrl = queryStr ? `${window.location.pathname}?${queryStr}` : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  }, [mounted, filters, debouncedSearch, sortBy]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (filters.location && !filters.location.startsWith("All") && !filters.location.startsWith("Any")) count++;
    if (filters.guests && !filters.guests.startsWith("Any")) count++;
    if (filters.budget && !filters.budget.startsWith("Any")) count++;
    if (filters.venueType && !filters.venueType.startsWith("All") && !filters.venueType.startsWith("Any")) count++;
    if (filters.space && !filters.space.startsWith("All") && !filters.space.startsWith("Any")) count++;
    if (filters.theme && !filters.theme.startsWith("All") && !filters.theme.startsWith("Any")) count++;
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

          {/* Quick Theme & Price Filter Chips */}
          <div className="mt-4 flex items-center justify-center gap-2 overflow-x-auto pb-1 max-w-5xl mx-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {QUICK_THEME_PILLS.map((pill) => {
              const isThemeActive =
                pill.type === "theme" && filters.theme === pill.value;
              const isBudgetActive = pill.type === "budget" && filters.budget === pill.value;
              const isAllActive =
                pill.type === "all" &&
                (!filters.theme || filters.theme.startsWith("All")) &&
                (!filters.budget || filters.budget.startsWith("Any"));
              const isActive = isThemeActive || isBudgetActive || isAllActive;

              return (
                <button
                  key={pill.label}
                  type="button"
                  onClick={() => {
                    if (pill.type === "theme") {
                      handleFilterChange("theme", pill.value);
                    } else if (pill.type === "budget") {
                      handleFilterChange("budget", pill.value);
                    } else if (pill.type === "all") {
                      handleFilterChange("theme", "All Themes");
                      handleFilterChange("budget", "Any Budget");
                    }
                    setTimeout(handleScrollToGrid, 80);
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-[#8B263E] text-white shadow-sm ring-1 ring-[#8B263E]"
                      : "bg-white/80 hover:bg-white text-neutral-700 hover:text-neutral-900 border border-[#C5A880]/30 hover:border-[#C5A880]"
                  }`}
                >
                  <span>{pill.label}</span>
                </button>
              );
            })}
          </div>
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
        onPrefetchNext={handlePrefetchNext}
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
