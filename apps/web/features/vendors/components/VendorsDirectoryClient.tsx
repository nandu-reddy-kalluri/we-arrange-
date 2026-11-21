"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Vendor } from "@/mock-data/vendors";
import { fetchPaginatedVendors } from "@/services/catalog/catalogApi";

// Subcomponents
import { HeroSection } from "./HeroSection";
import { CategoryGrid } from "./CategoryGrid";
import { VendorFilters, FilterState } from "./VendorFilters";
import { FeaturedVendors } from "./FeaturedVendors";

const INITIAL_FILTERS: FilterState = {
  category: "",
  city: "",
  budgetTier: "",
  rating: "",
  experience: "",
  availability: "",
  isVerified: false,
  spaceType: "",
  sortBy: "popularity",
  minPrice: 0,
  maxPrice: 10,
};

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton / Page Loader
// ─────────────────────────────────────────────────────────────────────────────

export function PageLoader() {
  return (
    <div className="w-full min-h-screen bg-[#FBF7F2] flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#C5A880]/20 border-t-[#8B263E] animate-spin" />
        <span className="text-xs font-black uppercase tracking-widest text-[#C5A880]">
          Loading Luxury Catalog...
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Memoized Vendor Grid wrapper
// Only re-renders when filteredVendors, filters, or searchQuery change.
// ─────────────────────────────────────────────────────────────────────────────

const MemoizedVendorGrid = React.memo(FeaturedVendors);

// ─────────────────────────────────────────────────────────────────────────────
// Main Client Component
// ─────────────────────────────────────────────────────────────────────────────

export function VendorsDirectoryClient({ defaultCategory = "" }: { defaultCategory?: string }) {
  // Defer rendering until after hydration
  const [mounted, setMounted] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    ...INITIAL_FILTERS,
    category: defaultCategory || INITIAL_FILTERS.category,
  });
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to page 1 when server-side query params change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters.category, filters.city, filters.rating, filters.isVerified, filters.sortBy]);

  useEffect(() => {
    if (!mounted) return;
    let active = true;
    setIsLoading(true);
    setError(null);

    const serverSortBy: "relevance" | "rating" | "reviews" | "newest" =
      filters.sortBy === "top-rated" || filters.sortBy === "highest-rated"
        ? "rating"
        : filters.sortBy === "most-reviewed"
          ? "reviews"
          : filters.sortBy === "newest"
            ? "newest"
            : "relevance";
    const parsedMinRating = filters.rating ? parseFloat(filters.rating) : undefined;

    void fetchPaginatedVendors({
      page,
      limit: 20,
      q: debouncedSearch || undefined,
      category: filters.category || undefined,
      city: filters.city || undefined,
      verifiedOnly: filters.isVerified || undefined,
      minRating: Number.isFinite(parsedMinRating) ? parsedMinRating : undefined,
      sortBy: serverSortBy,
    }).then((result) => {
      if (!active) return;
      setVendors(result.items);
      setTotalCount(result.meta.total);
      setTotalPages(Math.max(1, result.meta.totalPages));
      setError(result.error ?? null);
      setIsLoading(false);
    });

    return () => {
      active = false;
    };
  }, [mounted, page, debouncedSearch, filters.category, filters.city, filters.rating, filters.isVerified, filters.sortBy, reloadTick]);

  // URL param init
  useEffect(() => {
    if (!mounted) return;
    const params = new URLSearchParams(window.location.search);
    const categoryParam = params.get("category");
    const cityParam = params.get("city");
    const searchParam = params.get("search");
    if (categoryParam || cityParam || searchParam) {
      setFilters((prev) => ({
        ...prev,
        category: categoryParam || prev.category,
        city: cityParam || prev.city,
      }));
      setSearchQuery(searchParam || "");
      setTimeout(() => {
        document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth" });
      }, 500);
    }
  }, [mounted]);

  // ── Optional client-side refinements + sorting without hiding backend search/category matches ──
  const filteredVendors = useMemo(() => {
    const list = vendors.filter((vendor) => {
      if (filters.budgetTier && vendor.tier && vendor.tier !== filters.budgetTier) return false;
      if (filters.rating && vendor.rating < parseFloat(filters.rating)) return false;
      if (filters.experience && (vendor.experience || 0) < parseInt(filters.experience, 10)) return false;
      if (filters.availability && vendor.availability && vendor.availability !== "Available") return false;
      if (filters.isVerified && !vendor.isVerified) return false;
      if (filters.spaceType && vendor.spaceType) {
        const t = filters.spaceType.toLowerCase();
        const isIndoor = ["indoor", "banquet", "banquet hall"].includes(t);
        const isOutdoor = ["outdoor", "garden", "rooftop", "beach", "palace"].includes(t);
        if (isIndoor && vendor.spaceType !== "Indoor" && vendor.spaceType !== "Both") return false;
        if (isOutdoor && vendor.spaceType !== "Outdoor" && vendor.spaceType !== "Both") return false;
      }
      if (filters.minPrice > 0 && vendor.priceStart < filters.minPrice) return false;
      if (filters.maxPrice < 10 && vendor.priceStart > filters.maxPrice) return false;
      return true;
    });

    if (filters.sortBy === "top-rated" || filters.sortBy === "highest-rated")
      return [...list].sort((a, b) => b.rating - a.rating);
    if (filters.sortBy === "low-to-high")
      return [...list].sort((a, b) => a.priceStart - b.priceStart);
    if (filters.sortBy === "high-to-low")
      return [...list].sort((a, b) => b.priceStart - a.priceStart);
    if (filters.sortBy === "newest")
      return [...list].sort((a, b) => b.id.localeCompare(a.id));
    if (filters.sortBy === "fastest-response")
      return [...list].sort((a, b) => (a.experience || 0) - (b.experience || 0));
    if (filters.sortBy === "most-reviewed")
      return [...list].sort((a, b) => b.reviewsCount - a.reviewsCount || b.rating - a.rating);
    return list;
  }, [filters, vendors]);

  // ── Stable callbacks (prevent child re-renders) ──
  const handleSelectCategory = useCallback((slug: string) => {
    setFilters((prev) => ({ ...prev, category: slug }));
    document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleSearchSubmit = useCallback(() => {
    document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setSearchQuery("");
  }, []);

  const handleCloseMobileFilter = useCallback(() => {
    setIsMobileFilterOpen(false);
  }, []);

  const handleOpenMobileFilter = useCallback(() => {
    setIsMobileFilterOpen(true);
  }, []);

  if (!mounted) return <PageLoader />;

  return (
    <main className="min-h-screen bg-[#FBF7F2] text-neutral-charcoal">

      {/* 1. Hero Search Section */}
      <HeroSection
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={filters.category}
        setSelectedCategory={(slug) => setFilters((prev) => ({ ...prev, category: slug }))}
        selectedCity={filters.city}
        setSelectedCity={(city) => setFilters((prev) => ({ ...prev, city }))}
        onSearch={handleSearchSubmit}
      />

      {/* 2. Main Directory Grid & Filters */}
      <section id="results-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-28 scroll-mt-24">
        <div className="flex flex-col gap-6">

          {/* Mobile floating filter toggle */}
          <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-auto shadow-[0_8px_30px_rgba(139,38,62,0.3)] rounded-full">
            <button
              type="button"
              onClick={handleOpenMobileFilter}
              className="flex items-center gap-2 bg-[#8B263E] text-white px-6 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#6e1c2f] transition-all"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters &amp; Sort</span>
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left: Filters sidebar */}
            <VendorFilters
              filters={filters}
              setFilters={setFilters}
              onClearFilters={handleClearFilters}
              isOpen={isMobileFilterOpen}
              onClose={handleCloseMobileFilter}
            />

            {/* Right: Memoized vendor grid */}
            <div className="flex-grow">
              <MemoizedVendorGrid
                vendors={filteredVendors}
                totalCount={totalCount}
                filters={filters}
                setFilters={setFilters}
                onResetFilters={handleClearFilters}
                isLoading={isLoading}
                error={error}
                onRetry={() => setReloadTick((n) => n + 1)}
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            </div>
          </div>

        </div>
      </section>

      {/* 3. Category Showcase Grid */}
      <CategoryGrid
        onSelectCategory={handleSelectCategory}
        selectedCategory={filters.category}
      />
    </main>
  );
}
