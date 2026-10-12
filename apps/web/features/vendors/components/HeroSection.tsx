"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import { Search, MapPin, Grid, Sparkles, ChevronDown, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { vendorCategories } from "@/mock-data/vendors";

interface HeroSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  onSearch: () => void;
}

const POPULAR_CHIPS = [
  { label: "Photographers", slug: "photography" },
  { label: "Decorators", slug: "decor" },
  { label: "Makeup Artists", slug: "makeup" },
  { label: "Mehendi Artists", slug: "mehendi" },
  { label: "Caterers", slug: "catering" },
];

const POPULAR_VENDOR_SUGGESTIONS = [
  { title: "Wedding Photographers", category: "photography", type: "Category" },
  { title: "Wedding Decorators", category: "decor", type: "Category" },
  { title: "Bridal Makeup Artists", category: "makeup", type: "Category" },
  { title: "Mehendi Artists", category: "mehendi", type: "Category" },
  { title: "Wedding Catering", category: "catering", type: "Category" },
  { title: "Rishi & Karan Photography", category: "photography", type: "Verified Vendor" },
  { title: "The Royal Decor Co.", category: "decor", type: "Verified Vendor" },
  { title: "Glamour by Shreya", category: "makeup", type: "Verified Vendor" },
  { title: "Henna by Ayesha", category: "mehendi", type: "Verified Vendor" },
  { title: "Spice & Saffron Caterers", category: "catering", type: "Verified Vendor" },
  { title: "House of Vows", category: "photography", type: "Verified Vendor" },
  { title: "Pre-Wedding Photoshoot", category: "photography", type: "Service" },
  { title: "Luxury Floral Mandap", category: "decor", type: "Service" },
  { title: "HD Airbrush Bridal Makeup", category: "makeup", type: "Service" },
  { title: "Royal Feast Catering", category: "catering", type: "Service" },
];

export function HeroSection({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedCity,
  setSelectedCity,
  onSearch,
}: HeroSectionProps) {
  const [activeDropdown, setActiveDropdown] = useState<"vendor" | "category" | "city" | null>(null);
  const [categorySearch, setCategorySearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const vendorInputRef = useRef<HTMLInputElement>(null);

  // Available cities from mock data
  const cities = useMemo(() => ["Hyderabad", "Goa", "Jaipur", "Udaipur", "Mumbai", "Delhi", "Kerala", "Bangalore", "Chennai", "Kolkata"], []);

  // Close dropdowns on click outside or escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Smart letter-based matching for vendor recommendations
  const filteredVendorSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return POPULAR_VENDOR_SUGGESTIONS;
    return POPULAR_VENDOR_SUGGESTIONS.filter((item) =>
      item.title.toLowerCase().includes(q) || item.type.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Smart letter-based matching for categories
  const filteredCategories = useMemo(() => {
    const q = categorySearch.trim().toLowerCase();
    if (!q) return vendorCategories;
    return vendorCategories.filter((c) =>
      c.name.toLowerCase().includes(q)
    );
  }, [categorySearch]);

  // Smart letter-based matching for cities
  const filteredCities = useMemo(() => {
    const q = citySearch.trim().toLowerCase();
    if (!q) return cities;
    return cities.filter((c) =>
      c.toLowerCase().includes(q)
    );
  }, [citySearch, cities]);

  const handleChipClick = (slug: string) => {
    setSelectedCategory(selectedCategory === slug ? "" : slug);
    setActiveDropdown(null);
    onSearch();
  };

  const selectedCategoryName = useMemo(() => {
    return vendorCategories.find((c) => c.slug === selectedCategory)?.name || null;
  }, [selectedCategory]);

  const handleExplore = () => {
    setActiveDropdown(null);
    onSearch();
  };

  return (
    <section className="relative w-full min-h-0 md:min-h-[60vh] flex items-center justify-center bg-[#FBF7F2] overflow-visible pt-28 pb-14 md:pt-32 md:pb-16">
      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Decorative Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#C5A880]/30 shadow-sm mb-4 md:mb-6 animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#8B263E]">
            Curated Elite Partnerships
          </span>
        </div>

        {/* Heading */}
        <h1 className="font-serif font-light text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight tracking-tight mb-4 md:mb-5 max-w-[85%] md:max-w-[70%] lg:max-w-2xl mx-auto text-neutral-900">
          Find Your Perfect <span className="font-semibold text-[#C5A880]">Wedding Vendor</span>
        </h1>

        {/* Subheading */}
        <p className="font-sans text-xs sm:text-sm md:text-base max-w-xl text-neutral-600 font-medium mb-8 md:mb-10 leading-relaxed mx-auto">
          Discover handpicked, verified wedding professionals to make your dream celebrations in Hyderabad and across India absolutely unforgettable.
        </p>

        {/* Premium Search Container (Venues Style - Expanded Size) */}
        <div
          ref={containerRef}
          className={`w-full bg-white/95 backdrop-blur-xl border border-[#C5A880]/25 rounded-2xl md:rounded-full p-2.5 md:p-3 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_50px_-10px_rgba(197,168,128,0.2)] transition-all duration-300 flex flex-col md:flex-row items-stretch md:items-center gap-2 max-w-4xl text-neutral-charcoal relative ${activeDropdown ? "z-[999]" : "z-30"}`}
        >
          {/* 1. Input: Search Vendors with Recommendation Dropdown */}
          <div className="relative w-full md:w-auto md:flex-[1.2] flex items-center gap-3 px-4 sm:px-5 py-2.5 md:py-2 border-b md:border-b-0 md:border-r border-gray-200/60">
            <Search className={`w-4 h-4 md:w-5 md:h-5 shrink-0 transition-colors ${searchQuery ? "text-[#8B263E]" : "text-[#C5A880]"}`} />
            <div className="flex flex-col items-start leading-tight w-full min-w-0">
              <span className="text-[10px] md:text-[11px] uppercase font-bold tracking-wider text-neutral-400">
                Vendor Name
              </span>
              <input
                ref={vendorInputRef}
                type="text"
                placeholder="Search vendor or service..."
                value={searchQuery}
                onFocus={() => setActiveDropdown("vendor")}
                onClick={() => setActiveDropdown("vendor")}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeDropdown !== "vendor") setActiveDropdown("vendor");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleExplore()}
                className="w-full bg-transparent border-none text-[13px] md:text-[14px] font-semibold focus:outline-none placeholder-neutral-400 text-neutral-800 p-0 mt-0.5"
              />
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-neutral-400 hover:text-neutral-700 p-1 transition-colors"
                aria-label="Clear vendor name search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Vendor Recommendation Dropdown Popover */}
            <AnimatePresence>
              {activeDropdown === "vendor" && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.96 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                  className="absolute left-0 top-full mt-2.5 w-80 max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.22)] border border-[#C5A880]/30 p-3 z-[1000] text-left"
                >
                  <div className="px-3 py-1 border-b border-neutral-100 mb-1 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5A880]">
                      {searchQuery.trim() ? "Matching Recommendations" : "Popular Vendor Services"}
                    </span>
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="text-[10px] text-neutral-400 hover:text-[#8B263E] font-semibold transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-0.5 pr-1 scrollbar-thin">
                    {filteredVendorSuggestions.map((item, idx) => (
                      <button
                        key={`${item.title}-${idx}`}
                        type="button"
                        onClick={() => {
                          setSearchQuery(item.title);
                          if (item.category) setSelectedCategory(item.category);
                          setActiveDropdown(null);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl font-medium text-neutral-800 hover:bg-[#FAF5ED] hover:text-[#8B263E] transition-all text-left group"
                      >
                        <div className="flex flex-col min-w-0 pr-2">
                          <span className="truncate font-semibold group-hover:text-[#8B263E]">{item.title}</span>
                          <span className="text-[10px] text-neutral-400">{item.type}</span>
                        </div>
                        <span className="text-[10px] font-bold text-[#C5A880] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">Select →</span>
                      </button>
                    ))}

                    {filteredVendorSuggestions.length === 0 && (
                      <div className="text-center py-6 px-3">
                        <p className="text-xs text-neutral-500 font-medium">No matching vendors found for &quot;{searchQuery}&quot;</p>
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          className="mt-2 text-xs text-[#8B263E] font-bold hover:underline"
                        >
                          Show all recommendations
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 2. Interactive Dropdown: Category */}
          <div className="relative w-full md:w-auto md:flex-1 border-b md:border-b-0 md:border-r border-gray-200/60 pb-2 md:pb-0">
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === "category" ? null : "category")}
              className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 md:py-2 rounded-xl md:rounded-full text-left transition-all duration-200 outline-none ${
                activeDropdown === "category"
                  ? "bg-[#FAF5ED] ring-2 ring-[#C5A880] shadow-sm"
                  : selectedCategory
                  ? "bg-[#FAF5ED] border border-[#C5A880]/50 text-neutral-900"
                  : "hover:bg-[#FBF8F4] text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <Grid className={`w-4 h-4 md:w-5 md:h-5 shrink-0 transition-colors ${selectedCategory || activeDropdown === "category" ? "text-[#8B263E]" : "text-[#C5A880]"}`} />
                <div className="flex flex-col items-start leading-tight min-w-0">
                  <span className="text-[10px] md:text-[11px] uppercase font-bold tracking-wider text-neutral-400">
                    Category
                  </span>
                  <span className={`text-[13px] md:text-[14px] font-semibold truncate ${
                    selectedCategory ? "text-[#8B263E]" : "text-neutral-800"
                  }`}>
                    {selectedCategoryName || "All Categories"}
                  </span>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${activeDropdown === "category" ? "rotate-180 text-[#8B263E]" : "text-neutral-400"}`} />
            </button>

            {/* Category Dropdown Popover (Venues Style Animation & Visuals) */}
            <AnimatePresence>
              {activeDropdown === "category" && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.96 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="absolute left-0 right-0 md:right-auto md:w-80 top-full mt-2 bg-white rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.22)] border border-[#C5A880]/30 p-3 z-[1000] text-left"
                >
                  <div className="px-2 py-1 border-b border-neutral-100 mb-2 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5A880]">
                      Select Category
                    </span>
                    {selectedCategory && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCategory("");
                          setActiveDropdown(null);
                        }}
                        className="text-[10px] text-neutral-400 hover:text-[#8B263E] font-semibold transition-colors"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  {/* Letter-based Category Search Filter */}
                  <div className="relative mb-2 px-1">
                    <div className="flex items-center gap-2 bg-[#FAF5ED]/70 border border-[#C5A880]/30 rounded-xl px-2.5 py-1.5 focus-within:border-[#8B263E] transition-colors">
                      <Search className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <input
                        type="text"
                        placeholder="Type to filter categories (e.g. photo, dec)..."
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        className="w-full bg-transparent border-none text-xs focus:outline-none placeholder-neutral-400 text-neutral-800"
                        autoFocus
                      />
                      {categorySearch && (
                        <button
                          type="button"
                          onClick={() => setCategorySearch("")}
                          className="text-neutral-400 hover:text-neutral-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-0.5 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory("");
                        setActiveDropdown(null);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl font-medium transition-all text-left ${
                        !selectedCategory
                          ? "bg-[#FAF5ED] text-[#8B263E] font-bold"
                          : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                      }`}
                    >
                      <span>All Categories</span>
                      {!selectedCategory && <Check className="w-3.5 h-3.5 text-[#8B263E]" />}
                    </button>

                    {filteredCategories.map((cat) => {
                      const isSelected = selectedCategory === cat.slug;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(cat.slug);
                            setActiveDropdown(null);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl font-medium transition-all text-left ${
                            isSelected
                              ? "bg-[#FAF5ED] text-[#8B263E] font-bold"
                              : "text-neutral-700 hover:bg-[#FAF5ED]/50 hover:text-neutral-900"
                          }`}
                        >
                          <span className="truncate">{cat.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#8B263E]" />}
                        </button>
                      );
                    })}

                    {filteredCategories.length === 0 && (
                      <div className="text-center py-5 px-2">
                        <p className="text-xs text-neutral-500">No categories matching &quot;{categorySearch}&quot;</p>
                        <button
                          type="button"
                          onClick={() => setCategorySearch("")}
                          className="mt-1.5 text-xs text-[#8B263E] font-bold hover:underline"
                        >
                          Clear search
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 3. Interactive Dropdown: City */}
          <div className="relative w-full md:w-auto md:flex-1">
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === "city" ? null : "city")}
              className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 md:py-2 rounded-xl md:rounded-full text-left transition-all duration-200 outline-none ${
                activeDropdown === "city"
                  ? "bg-[#FAF5ED] ring-2 ring-[#C5A880] shadow-sm"
                  : selectedCity
                  ? "bg-[#FAF5ED] border border-[#C5A880]/50 text-neutral-900"
                  : "hover:bg-[#FBF8F4] text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <MapPin className={`w-4 h-4 md:w-5 md:h-5 shrink-0 transition-colors ${selectedCity || activeDropdown === "city" ? "text-[#8B263E]" : "text-[#C5A880]"}`} />
                <div className="flex flex-col items-start leading-tight min-w-0">
                  <span className="text-[10px] md:text-[11px] uppercase font-bold tracking-wider text-neutral-400">
                    City
                  </span>
                  <span className={`text-[13px] md:text-[14px] font-semibold truncate ${
                    selectedCity ? "text-[#8B263E]" : "text-neutral-800"
                  }`}>
                    {selectedCity || "All Cities"}
                  </span>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${activeDropdown === "city" ? "rotate-180 text-[#8B263E]" : "text-neutral-400"}`} />
            </button>

            {/* City Dropdown Popover (Venues Style Animation & Visuals) */}
            <AnimatePresence>
              {activeDropdown === "city" && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.96 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="absolute left-0 right-0 md:left-auto md:right-0 md:w-72 top-full mt-2 bg-white rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.22)] border border-[#C5A880]/30 p-3 z-[1000] text-left"
                >
                  <div className="px-2 py-1 border-b border-neutral-100 mb-2 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5A880]">
                      Select City
                    </span>
                    {selectedCity && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCity("");
                          setActiveDropdown(null);
                        }}
                        className="text-[10px] text-neutral-400 hover:text-[#8B263E] font-semibold transition-colors"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  {/* Letter-based City Search Filter */}
                  <div className="relative mb-2 px-1">
                    <div className="flex items-center gap-2 bg-[#FAF5ED]/70 border border-[#C5A880]/30 rounded-xl px-2.5 py-1.5 focus-within:border-[#8B263E] transition-colors">
                      <Search className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <input
                        type="text"
                        placeholder="Type to filter cities (e.g. hy, goa)..."
                        value={citySearch}
                        onChange={(e) => setCitySearch(e.target.value)}
                        className="w-full bg-transparent border-none text-xs focus:outline-none placeholder-neutral-400 text-neutral-800"
                        autoFocus
                      />
                      {citySearch && (
                        <button
                          type="button"
                          onClick={() => setCitySearch("")}
                          className="text-neutral-400 hover:text-neutral-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-0.5 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCity("");
                        setActiveDropdown(null);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl font-medium transition-all text-left ${
                        !selectedCity
                          ? "bg-[#FAF5ED] text-[#8B263E] font-bold"
                          : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                      }`}
                    >
                      <span>All Cities</span>
                      {!selectedCity && <Check className="w-3.5 h-3.5 text-[#8B263E]" />}
                    </button>

                    {filteredCities.map((city) => {
                      const isSelected = selectedCity === city;
                      return (
                        <button
                          key={city}
                          type="button"
                          onClick={() => {
                            setSelectedCity(city);
                            setActiveDropdown(null);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl font-medium transition-all text-left ${
                            isSelected
                              ? "bg-[#FAF5ED] text-[#8B263E] font-bold"
                              : "text-neutral-700 hover:bg-[#FAF5ED]/50 hover:text-neutral-900"
                          }`}
                        >
                          <span className="truncate">{city}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#8B263E]" />}
                        </button>
                      );
                    })}

                    {filteredCities.length === 0 && (
                      <div className="text-center py-5 px-2">
                        <p className="text-xs text-neutral-500">No cities matching &quot;{citySearch}&quot;</p>
                        <button
                          type="button"
                          onClick={() => setCitySearch("")}
                          className="mt-1.5 text-xs text-[#8B263E] font-bold hover:underline"
                        >
                          Clear search
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 4. Explore Button */}
          <button
            type="button"
            onClick={handleExplore}
            className="w-full md:w-auto bg-gradient-to-r from-[#8B263E] to-[#6e1c2f] hover:from-[#761e33] hover:to-[#591424] text-white px-8 py-3.5 md:py-3.5 rounded-full flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(139,38,62,0.3)] hover:shadow-[0_6px_20px_rgba(139,38,62,0.45)] transition-all duration-300 active:scale-[0.98] whitespace-nowrap mt-1 md:mt-0"
          >
            <Search className="w-4 h-4 text-white" />
            <span className="text-xs md:text-sm font-bold uppercase tracking-widest">
              Explore
            </span>
          </button>
        </div>

        {/* Popular Search Chips */}
        <div className="mt-6 md:mt-8 flex flex-wrap justify-center items-center gap-2 md:gap-2.5 max-w-3xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mr-1">
            Popular:
          </span>
          {POPULAR_CHIPS.map((chip) => (
            <button
              key={chip.slug}
              type="button"
              onClick={() => handleChipClick(chip.slug)}
              className={`px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-medium tracking-wide transition-all duration-300 border shadow-sm ${
                selectedCategory === chip.slug
                  ? "bg-[#8B263E] text-white border-transparent"
                  : "bg-white text-neutral-700 border-[#C5A880]/25 hover:bg-[#FAF5ED] hover:text-[#8B263E] hover:border-[#C5A880]/50"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
