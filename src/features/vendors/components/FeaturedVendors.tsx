"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, MapPin, CheckCircle, ChevronLeft, ChevronRight, X, Star, Trophy, Zap, Check, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Vendor, vendorCategories } from "@/mock-data/vendors";
import { FilterState } from "./VendorFilters";

interface FeaturedVendorsProps {
  vendors: Vendor[];
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onResetFilters: () => void;
  isLoading?: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const formatPrice = (lakhs: number) => {
  const rupees = lakhs * 100000;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(rupees);
};

// Skeleton Loader Grid Card
function GridCardSkeleton() {
  return (
    <div className="bg-white rounded-[22px] border border-gray-150 p-4 flex flex-col justify-between gap-4 max-w-[340px] w-full mx-auto shadow-sm animate-pulse">
      <div className="h-[220px] bg-gray-100 rounded-t-[22px] w-full" />
      <div className="flex-grow flex flex-col gap-3">
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
        <div className="flex gap-2 mt-2">
          <div className="h-6 bg-gray-100 rounded-full w-12" />
          <div className="h-6 bg-gray-100 rounded-full w-16" />
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-gray-50 mt-3">
          <div className="h-4 bg-gray-100 rounded w-1/4" />
          <div className="flex gap-2">
            <div className="h-10 bg-gray-100 rounded-full w-20" />
            <div className="h-10 bg-gray-100 rounded-full w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Skeleton Loader List Card
function ListCardSkeleton() {
  return (
    <div className="bg-white border border-gray-150 rounded-[22px] p-4 flex flex-col sm:flex-row gap-4 shadow-sm w-full animate-pulse">
      <div className="h-[180px] w-full sm:w-[240px] bg-gray-100 rounded-[18px]" />
      <div className="flex-grow flex flex-col justify-between gap-3">
        <div>
          <div className="h-4 bg-gray-100 rounded w-1/2 mb-2" />
          <div className="h-3 bg-gray-100 rounded w-1/4 mb-2" />
          <div className="h-3 bg-gray-100 rounded w-1/3" />
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-gray-50">
          <div className="h-4 bg-gray-100 rounded w-1/5" />
          <div className="flex gap-2">
            <div className="h-9 bg-gray-100 rounded-full w-20" />
            <div className="h-9 bg-gray-100 rounded-full w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Lightweight Sort Select dropdown for Toolbar
function ToolbarSortSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options = [
    { label: "Recommended", value: "popularity" },
    { label: "Popularity", value: "most-reviewed" },
    { label: "Highest Rated", value: "top-rated" },
    { label: "Most Reviewed", value: "most-reviewed" },
    { label: "Price Low → High", value: "low-to-high" },
    { label: "Price High → Low", value: "high-to-low" },
    { label: "Newest", value: "newest" },
    { label: "Fastest Response", value: "fastest-response" },
  ];

  const selectedOption = options.find((o) => o.value === value) || options[0];

  return (
    <div ref={containerRef} className="relative z-25">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 border border-gray-200 bg-white hover:border-[#C5A880] rounded-lg text-[11px] font-bold text-neutral-charcoal flex items-center gap-1 transition-all cursor-pointer select-none"
      >
        <span>Sort: {selectedOption.label}</span>
        <ChevronDown className="w-3 h-3 text-gray-400" />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 3 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute right-0 bg-white border border-[#C5A880]/20 rounded-xl shadow-lg overflow-hidden py-1 w-44"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-[10px] font-bold hover:bg-[#FAF9F6] transition-colors flex items-center justify-between cursor-pointer ${
                  value === opt.value ? "text-[#8B263E] bg-[#FAF9F6]" : "text-neutral-charcoal"
                }`}
              >
                <span>{opt.label}</span>
                {value === opt.value && <Check className="w-3 h-3 text-[#C5A880]" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FeaturedVendors({
  vendors,
  filters,
  setFilters,
  onResetFilters,
  isLoading = false,
  searchQuery,
  setSearchQuery,
}: FeaturedVendorsProps) {
  const router = useRouter();

  // View mode switcher: grid vs list layout
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Local Search Input state for debouncing
  const [searchVal, setSearchVal] = useState(searchQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Autocomplete Suggestions List
  const suggestions = [
    "Photography",
    "Photographer",
    "Photo Booth",
    "Photobooth Decor",
    "Makeup Artist",
    "Makeup",
    "Bridal Makeup",
    "Wedding Decorator",
    "Decorator",
    "Catering",
    "Mehendi Artist",
  ];

  const filteredSuggestions = suggestions.filter((sug) =>
    sug.toLowerCase().startsWith(searchVal.toLowerCase()) && searchVal.length > 0
  );

  // Sync internal search state if searchQuery changes externally (like reset)
  useEffect(() => {
    setSearchVal(searchQuery);
  }, [searchQuery]);

  // Debouncing search value (250ms delay)
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchVal);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchVal, setSearchQuery]);

  // Handle outside click to close autocomplete suggestion drop
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Quick chips toggling handlers
  const handleToggleVerifiedChip = () => {
    setFilters((prev) => ({ ...prev, isVerified: !prev.isVerified }));
  };
  const handleToggleTopRatedChip = () => {
    setFilters((prev) => ({ ...prev, rating: prev.rating === "4.5" ? "" : "4.5" }));
  };
  const handleToggleBridesChoiceChip = () => {
    setFilters((prev) => ({ ...prev, budgetTier: prev.budgetTier === "Luxury" ? "" : "Luxury" }));
  };
  const handleToggleFastResponseChip = () => {
    setFilters((prev) => ({ ...prev, experience: prev.experience === "10" ? "" : "10" }));
  };

  const handleSuggestionSelect = (sug: string) => {
    setSearchVal(sug);
    setShowSuggestions(false);
  };

  const [wishlist, setWishlist] = useState<Record<string, boolean>>({
    "1": true,
    "3": true,
  });

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCardClick = (slug: string) => {
    router.push(`/vendors/${slug}`);
  };

  // Compile active chips to display clearable tags
  const activeChips = React.useMemo(() => {
    const chips: { label: string; key: keyof FilterState; resetValue: FilterState[keyof FilterState] }[] = [];
    if (filters.category) {
      const catName = vendorCategories.find(c => c.slug === filters.category)?.name || filters.category;
      chips.push({ label: catName, key: "category", resetValue: "" });
    }
    if (filters.city) {
      chips.push({ label: filters.city, key: "city", resetValue: "" });
    }
    if (filters.budgetTier) {
      chips.push({ label: `${filters.budgetTier} Segment`, key: "budgetTier", resetValue: "" });
    }
    if (filters.rating) {
      chips.push({ label: `${filters.rating}★ & Above`, key: "rating", resetValue: "" });
    }
    if (filters.minPrice !== 0.5 || filters.maxPrice !== 10) {
      chips.push({ label: `₹${filters.minPrice}L–₹${filters.maxPrice}L`, key: "minPrice", resetValue: 0.5 });
    }
    if (filters.experience) {
      chips.push({ label: `${filters.experience}+ Yrs Exp`, key: "experience", resetValue: "" });
    }
    if (filters.availability) {
      chips.push({ label: filters.availability, key: "availability", resetValue: "" });
    }
    if (filters.spaceType) {
      chips.push({ label: filters.spaceType, key: "spaceType", resetValue: "" });
    }
    if (filters.isVerified) {
      chips.push({ label: "Verified Only", key: "isVerified", resetValue: false });
    }
    return chips;
  }, [filters]);

  const handleRemoveChip = (key: keyof FilterState, resetValue: FilterState[keyof FilterState]) => {
    if (key === "minPrice") {
      setFilters((prev) => ({ ...prev, minPrice: 0.5, maxPrice: 10 }));
    } else {
      setFilters((prev) => ({ ...prev, [key]: resetValue }));
    }
  };

  return (
    <div className="flex flex-col gap-5">
      
      {/* 1. Large Top Search Bar with debouncing Suggestions */}
      <div ref={searchContainerRef} className="relative w-full">
        <div className="flex items-center bg-white border border-[#C5A880]/30 hover:border-[#C5A880]/60 focus-within:border-[#C5A880] focus-within:shadow-[0_4px_16px_rgba(197,168,128,0.15)] rounded-2xl px-4 py-3.5 transition-all shadow-sm">
          <span className="text-gray-400 mr-2 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search Vendors, Services or City..."
            value={searchVal}
            onChange={(e) => {
              setSearchVal(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            className="w-full bg-transparent border-none text-xs font-semibold text-neutral-charcoal placeholder-gray-400 focus:outline-none focus:ring-0 p-0"
          />
          {searchVal && (
            <button
              onClick={() => setSearchVal("")}
              className="text-gray-400 hover:text-neutral-charcoal p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Autocomplete suggestion drop links */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-40 left-0 right-0 top-full bg-white border border-[#C5A880]/20 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto">
            {filteredSuggestions.map((sug) => (
              <button
                key={sug}
                onClick={() => handleSuggestionSelect(sug)}
                className="w-full text-left px-4 py-2.5 text-xs text-neutral-charcoal hover:bg-[#FAF9F6] transition-colors font-bold cursor-pointer"
              >
                🔍 {sug}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Top Quick Filters row with Icons */}
      <div className="flex flex-wrap gap-2 py-1">
        <button
          onClick={handleToggleVerifiedChip}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-[10px] font-extrabold transition-all cursor-pointer ${
            filters.isVerified
              ? "bg-[#C5A880] border-[#C5A880] text-white shadow-sm"
              : "bg-white border-gray-200 text-neutral-charcoal hover:border-[#C5A880]"
          }`}
        >
          <Check className="w-3 h-3" />
          <span>Verified</span>
        </button>

        <button
          onClick={handleToggleTopRatedChip}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-[10px] font-extrabold transition-all cursor-pointer ${
            filters.rating === "4.5"
              ? "bg-[#C5A880] border-[#C5A880] text-white shadow-sm"
              : "bg-white border-gray-200 text-neutral-charcoal hover:border-[#C5A880]"
          }`}
        >
          <Star className="w-3 h-3" />
          <span>Top Rated</span>
        </button>

        <button
          onClick={handleToggleBridesChoiceChip}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-[10px] font-extrabold transition-all cursor-pointer ${
            filters.budgetTier === "Luxury"
              ? "bg-[#C5A880] border-[#C5A880] text-white shadow-sm"
              : "bg-white border-gray-200 text-neutral-charcoal hover:border-[#C5A880]"
          }`}
        >
          <Trophy className="w-3 h-3" />
          <span>Bride&apos;s Choice</span>
        </button>

        <button
          onClick={handleToggleFastResponseChip}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-[10px] font-extrabold transition-all cursor-pointer ${
            filters.experience === "10"
              ? "bg-[#C5A880] border-[#C5A880] text-white shadow-sm"
              : "bg-white border-gray-200 text-neutral-charcoal hover:border-[#C5A880]"
          }`}
        >
          <Zap className="w-3 h-3" />
          <span>Fast Response</span>
        </button>
      </div>

      {/* 3. Lightweight Toolbar - Segmented View Mode & Sort drop */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2.5 border-t border-b border-gray-100 gap-4">
        
        {/* Simple text info */}
        <div>
          <span className="text-[11px] font-extrabold text-neutral-charcoal">
            {vendors.length} Premium Wedding Vendors
          </span>
          <span className="text-[9px] text-[#C5A880] font-bold block mt-0.5 uppercase tracking-wider">
            Updated Today • Hyderabad
          </span>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          
          {/* Segmented layout selector: Grid vs List with sliding background */}
          <div className="relative flex items-center bg-gray-100 rounded-lg p-1 text-[10px] font-black uppercase tracking-wider select-none shrink-0 h-[32px]">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1 rounded-md relative z-10 transition-colors cursor-pointer ${
                viewMode === "grid" ? "text-neutral-charcoal" : "text-neutral-muted"
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1 rounded-md relative z-10 transition-colors cursor-pointer ${
                viewMode === "list" ? "text-neutral-charcoal" : "text-neutral-muted"
              }`}
            >
              List
            </button>
            {/* Sliding Pill */}
            <motion.div
              className="absolute top-1 bottom-1 bg-white rounded-md shadow-sm z-0"
              animate={{
                left: viewMode === "grid" ? 4 : 48,
                width: viewMode === "grid" ? 44 : 44,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            />
          </div>

          {/* Singular Toolbar Sort dropdown */}
          <ToolbarSortSelect
            value={filters.sortBy}
            onChange={(val) => setFilters((prev) => ({ ...prev, sortBy: val }))}
          />

        </div>
      </div>

      {/* 4. Active chips tags underneath toolbar */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
          <span className="text-[9px] font-extrabold uppercase text-neutral-muted tracking-wider">
            Selected:
          </span>
          {activeChips.map((chip) => (
            <div
              key={chip.key}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-[#C5A880]/30 bg-[#FAF9F6] text-neutral-charcoal text-[9px] font-bold shadow-sm"
            >
              <span>{chip.label}</span>
              <button
                onClick={() => handleRemoveChip(chip.key, chip.resetValue)}
                className="w-3.5 h-3.5 rounded-full flex items-center justify-center bg-[#8B263E]/10 hover:bg-[#8B263E] text-[#8B263E] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-1.5 h-1.5" />
              </button>
            </div>
          ))}
          <button
            onClick={onResetFilters}
            className="text-[9px] font-extrabold text-[#8B263E] hover:underline cursor-pointer ml-1"
          >
            Clear All
          </button>
        </div>
      )}

      {/* 5. Listing Grid / List layout cards */}
      {isLoading ? (
        <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
          {[...Array(6)].map((_, i) => (
            viewMode === "grid" ? <GridCardSkeleton key={i} /> : <ListCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          {/* Empty state when no vendors match */}
          {vendors.length === 0 ? (
            <div className="py-16 text-center bg-white border border-gray-150 rounded-[22px] flex flex-col items-center justify-center gap-3">
              <span className="text-3xl">📂</span>
              <h4 className="font-serif text-lg font-bold text-neutral-charcoal">No Vendors Match Your Filters</h4>
              <p className="text-xs text-neutral-muted max-w-sm leading-relaxed">
                We couldn&apos;t find any wedding specialists matching your selected price range or segment. Try clearing a few filters to see more profiles.
              </p>
              <button
                onClick={onResetFilters}
                className="px-5 py-2 rounded-full bg-[#8B263E] hover:bg-[#6e1c2f] text-white text-[10px] font-black uppercase tracking-wider mt-2 transition-all shadow cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
              {vendors.map((vendor, index) => {
                const isWishlisted = !!wishlist[vendor.id];
                
                {/* GRID VIEW CARD */}
                if (viewMode === "grid") {
                  return (
                    <motion.div
                      key={vendor.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: index * 0.02 }}
                      onClick={() => handleCardClick(vendor.slug)}
                      className="group bg-[#FAF9F6] rounded-[22px] overflow-hidden border border-[#C5A880]/20 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(197,168,128,0.1)] hover:-translate-y-2 hover:border-[#C5A880]/40 transition-all duration-350 flex flex-col justify-between max-w-[340px] mx-auto w-full cursor-pointer relative"
                    >
                      {/* Image */}
                      <div className="relative h-[220px] w-full overflow-hidden bg-gray-100 shrink-0 rounded-t-[22px]">
                        <img
                          src={vendor.imageUrl}
                          alt={vendor.name}
                          className="h-full w-full object-cover transition-transform duration-750 ease-out group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        
                        {/* Category tag */}
                        <div className="absolute top-3 left-3 bg-white/30 backdrop-blur-md border border-white/20 px-2.5 py-1 rounded-full text-[8px] font-black uppercase text-white tracking-widest shadow-sm z-10">
                          {vendor.category}
                        </div>

                        {/* Heart wishlist button */}
                        <motion.button
                          whileHover={{ scale: 1.1, rotate: 12 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => toggleWishlist(vendor.id, e)}
                          className="absolute top-3 right-3 w-8 h-8 bg-white/30 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center shadow-md text-white hover:text-[#8B263E] transition-all duration-300 z-10 cursor-pointer"
                        >
                          <Heart className={`w-3.5 h-3.5 transition-colors duration-300 ${isWishlisted ? "text-[#8B263E] fill-[#8B263E]" : ""}`} />
                        </motion.button>

                        {/* Verified badge */}
                        {vendor.isVerified && (
                          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-gradient-to-r from-[#8B263E] to-[#C5A880] px-2 py-0.5 rounded-md text-[8px] font-black uppercase text-white tracking-widest shadow-sm z-10">
                            <CheckCircle className="w-2.5 h-2.5 text-white" />
                            Verified
                          </div>
                        )}
                      </div>

                      {/* Details Content */}
                      <div className="p-4 flex-grow flex flex-col justify-between gap-3">
                        <div>
                          <h3 className="font-serif text-[18px] font-bold text-[#2D2D2D] leading-snug group-hover:text-[#8B263E] transition-colors duration-300 line-clamp-2 overflow-hidden text-ellipsis h-[52px]">
                            {vendor.name}
                          </h3>

                          {/* Ratings and reviews inline */}
                          <div className="flex items-center justify-between mt-1 text-[11px] font-bold">
                            <div className="flex items-center gap-1 text-neutral-charcoal">
                              <span className="text-[#C5A880]">★</span>
                              <span>{vendor.rating.toFixed(1)}</span>
                              <span className="text-gray-400 font-normal">({vendor.reviewsCount} Reviews)</span>
                            </div>

                            <div className="flex items-center gap-0.5 text-neutral-muted font-bold">
                              <MapPin className="w-3 h-3 text-[#C5A880] shrink-0" />
                              <span>{vendor.city}</span>
                            </div>
                          </div>

                          {/* 2 Tags format */}
                          {vendor.tags && (
                            <div className="text-[10px] font-bold text-[#8B263E] flex items-center gap-1 mt-2.5">
                              <span>{vendor.tags[0] || "Bridal Makeup"}</span>
                              <span className="text-gray-300 font-light">•</span>
                              <span>{vendor.tags[1] || "Airbrush"}</span>
                              <span className="text-gray-300 font-light">•</span>
                              <span className="text-neutral-muted font-extrabold uppercase tracking-wide text-[8px]">
                                +{vendor.tags.length > 2 ? vendor.tags.length - 2 : 10}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Pricing and Action row */}
                        <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between mt-auto">
                          <div>
                            <span className="text-[7.5px] uppercase font-black text-neutral-muted block tracking-widest">Starts From</span>
                            <span className="text-[13px] font-black text-[#8B263E]">{formatPrice(vendor.priceStart)}</span>
                          </div>
                          
                          <div className="flex gap-2">
                            <Link
                              href={`/vendors/${vendor.slug}`}
                              className="h-9 px-3 flex items-center justify-center rounded-full text-[9px] font-black uppercase tracking-wider text-[#C5A880] border border-[#C5A880] bg-white hover:bg-[#C5A880] hover:text-white transition-all duration-300 cursor-pointer"
                            >
                              View Details
                            </Link>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                alert(`Consultation inquiries initiated for ${vendor.name}`);
                              }}
                              className="h-9 px-3 rounded-full text-[9px] font-black uppercase tracking-wider text-white bg-gradient-to-r from-[#8B263E] to-[#A33B54] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(139,38,62,0.25)] transition-all duration-300 cursor-pointer"
                            >
                              Book Consultation
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                }

                {/* LIST VIEW CARD */}
                return (
                  <motion.div
                    key={vendor.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.02 }}
                    onClick={() => handleCardClick(vendor.slug)}
                    className="group bg-[#FAF9F6] border border-[#C5A880]/20 rounded-[22px] overflow-hidden p-4 shadow-sm hover:border-[#C5A880]/40 transition-colors flex flex-col sm:flex-row gap-4 w-full cursor-pointer relative"
                  >
                    {/* Left image part */}
                    <div className="relative h-[180px] w-full sm:w-[240px] rounded-[18px] overflow-hidden shrink-0 bg-gray-150">
                      <img
                        src={vendor.imageUrl}
                        alt={vendor.name}
                        className="w-full h-full object-cover transition-transform duration-750 ease-out group-hover:scale-105"
                      />
                      <div className="absolute top-2 left-2 bg-white/30 backdrop-blur-md border border-white/20 px-2 py-0.5 rounded-full text-[8px] font-black uppercase text-white tracking-widest">
                        {vendor.category}
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 12 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => toggleWishlist(vendor.id, e)}
                        className="absolute top-2 right-2 w-7.5 h-7.5 bg-white/30 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:text-[#8B263E] transition-colors cursor-pointer"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "text-[#8B263E] fill-[#8B263E]" : ""}`} />
                      </motion.button>
                    </div>

                    {/* Right details content part */}
                    <div className="flex-grow flex flex-col justify-between gap-3 min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-serif text-[18px] font-bold text-[#2D2D2D] leading-snug group-hover:text-[#8B263E] transition-colors truncate">
                            {vendor.name}
                          </h3>
                          {vendor.isVerified && (
                            <span className="flex items-center gap-0.5 bg-gradient-to-r from-[#8B263E] to-[#C5A880] text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded shrink-0">
                              <CheckCircle className="w-2.5 h-2.5 text-white" />
                              Verified
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-[11px] font-bold mt-1 text-neutral-muted">
                          <span className="text-neutral-charcoal">★ {vendor.rating.toFixed(1)} <span className="text-gray-400 font-normal">({vendor.reviewsCount} Reviews)</span></span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5"><MapPin className="w-3.5 h-3.5 text-[#C5A880]" /> {vendor.city}</span>
                        </div>

                        {vendor.tags && (
                          <div className="text-[10px] font-bold text-[#8B263E] flex items-center gap-1 mt-3">
                            <span>{vendor.tags[0]}</span>
                            <span className="text-gray-300 font-light">•</span>
                            <span>{vendor.tags[1]}</span>
                            <span className="text-gray-300 font-light">•</span>
                            <span className="text-neutral-muted font-extrabold uppercase tracking-wide text-[8px]">
                              +{vendor.tags.length - 2} More Services
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Pricing and Actions bottom part */}
                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between mt-auto">
                        <div>
                          <span className="text-[7.5px] uppercase font-black text-neutral-muted block tracking-widest">Starts From</span>
                          <span className="text-xs font-black text-[#8B263E]">{formatPrice(vendor.priceStart)}</span>
                        </div>

                        <div className="flex gap-2">
                          <Link
                            href={`/vendors/${vendor.slug}`}
                            className="h-9 px-3 flex items-center justify-center rounded-full text-[9px] font-black uppercase tracking-wider text-[#C5A880] border border-[#C5A880] bg-white hover:bg-[#C5A880] hover:text-white transition-all duration-300 cursor-pointer"
                          >
                            View Details
                          </Link>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              alert(`Consultation inquiries initiated for ${vendor.name}`);
                            }}
                            className="h-9 px-3 rounded-full text-[9px] font-black uppercase tracking-wider text-white bg-gradient-to-r from-[#8B263E] to-[#A33B54] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(139,38,62,0.25)] transition-all duration-300 cursor-pointer"
                          >
                            Book Consultation
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
