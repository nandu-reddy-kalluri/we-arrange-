"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { mockVendors, Vendor } from "@/mock-data/vendors";

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
  minPrice: 0.5,
  maxPrice: 10,
};

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton / Page Loader
// ─────────────────────────────────────────────────────────────────────────────

export function PageLoader() {
  return (
    <div className="w-full min-h-screen bg-neutral-cream flex flex-col items-center justify-center">
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

interface VendorGridProps {
  vendors: Vendor[];
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onResetFilters: () => void;
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const MemoizedVendorGrid = React.memo(function MemoizedVendorGrid({
  vendors,
  filters,
  setFilters,
  onResetFilters,
  isLoading,
  searchQuery,
  setSearchQuery,
}: VendorGridProps) {
  return (
    <FeaturedVendors
      vendors={vendors}
      filters={filters}
      setFilters={setFilters}
      onResetFilters={onResetFilters}
      isLoading={isLoading}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    />
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Main Client Component
// ─────────────────────────────────────────────────────────────────────────────

export function VendorsDirectoryClient({ defaultCategory = "" }: { defaultCategory?: string }) {
  const router = useRouter();

  // Defer rendering until after hydration
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    ...INITIAL_FILTERS,
    category: defaultCategory || INITIAL_FILTERS.category,
  });
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Transition skeleton — only fires when committed filters change
  const [isTransitioning, setIsTransitioning] = useState(false);
  useEffect(() => {
    if (!mounted) return;
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 320);
    return () => clearTimeout(timer);
  }, [filters, mounted]);

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

  // ── Filtered + sorted vendor list ──
  const filteredVendors = useMemo(() => {
    const list = mockVendors.filter((vendor) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !vendor.name.toLowerCase().includes(q) &&
          !vendor.tags?.some((t) => t.toLowerCase().includes(q)) &&
          !vendor.category.toLowerCase().includes(q)
        ) return false;
      }
      if (filters.category && vendor.category !== filters.category) return false;
      if (filters.city && vendor.city !== filters.city) return false;
      if (filters.budgetTier && vendor.tier !== filters.budgetTier) return false;
      if (filters.rating && vendor.rating < parseFloat(filters.rating)) return false;
      if (filters.experience && (vendor.experience || 0) < parseInt(filters.experience)) return false;
      if (filters.availability && vendor.availability !== "Available") return false;
      if (filters.isVerified && !vendor.isVerified) return false;
      if (filters.spaceType) {
        const t = filters.spaceType.toLowerCase();
        const isIndoor = ["indoor", "banquet", "banquet hall"].includes(t);
        const isOutdoor = ["outdoor", "garden", "rooftop", "beach", "palace"].includes(t);
        if (isIndoor && vendor.spaceType !== "Indoor" && vendor.spaceType !== "Both") return false;
        if (isOutdoor && vendor.spaceType !== "Outdoor" && vendor.spaceType !== "Both") return false;
      }
      if (filters.minPrice && vendor.priceStart < filters.minPrice) return false;
      if (filters.maxPrice && vendor.priceStart > filters.maxPrice) return false;
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
    return [...list].sort((a, b) => b.reviewsCount - a.reviewsCount);
  }, [filters, searchQuery]);

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
    <main className="min-h-screen bg-neutral-cream text-neutral-charcoal">

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
                filters={filters}
                setFilters={setFilters}
                onResetFilters={handleClearFilters}
                isLoading={isTransitioning}
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
