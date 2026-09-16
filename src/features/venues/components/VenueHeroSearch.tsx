"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Users,
  IndianRupee,
  Home,
  Sun,
  Search,
  SlidersHorizontal,
  X,
  Check,
  RotateCcw,
  ArrowRight,
  ChevronDown,
} from "lucide-react";

export interface VenueFilterState {
  location: string;
  guests: string;
  budget: string;
  venueType: string;
  space: string;
}

interface VenueHeroSearchProps {
  filters: VenueFilterState;
  onFilterChange: (key: keyof VenueFilterState, value: string) => void;
  onSearch: () => void;
  onReset: () => void;
  activeFilterCount: number;
}

export const POPULAR_LOCATIONS = [
  "Hyderabad",
  "Hyderabad City",
  "Gachibowli",
  "Jubilee Hills",
  "Banjara Hills",
  "Madhapur",
  "Hitec City",
  "KPHB",
  "Moinabad",
  "Secunderabad",
  "Shamshabad",
  "Financial District",
  "Kondapur",
  "Begumpet",
  "ORR",
  "MG Road",
  "Punjagutta",
  "Nagarjuna Sagar Rd",
  "Cyber Gardens Convention Centre",
  "Shivam Road",
  "Kukatpally",
  "Manikonda",
  "Abids",
  "Mehdipatnam",
  "Ameerpet",
  "Kompally",
  "Gandipet",
  "Alwal",
  "Uppal",
  "Toli Chowki",
  "Charminar",
  "Somajiguda",
];

export const GUEST_OPTIONS = [
  "50–100 Guests",
  "100–200 Guests",
  "200–500 Guests",
  "500–1000 Guests",
  "1000+ Guests",
];

export const BUDGET_OPTIONS = [
  "₹500 per plate",
  "₹1,000 per plate",
  "₹1,500 per plate",
  "₹2,000 per plate",
  "₹2,500 per plate",
  "₹3,000+ per plate",
  "Price on Request",
];

export const VENUE_TYPE_OPTIONS = [
  "Banquet Hall",
  "Wedding Hall",
  "Convention Centre",
  "Hotel",
  "Resort",
  "Lawn",
  "Farmhouse",
  "Palace",
  "Outdoor Venue",
  "Indoor Venue",
];

export const SPACE_OPTIONS = [
  "Indoor",
  "Outdoor",
  "Indoor & Outdoor",
];

export function VenueHeroSearch({
  filters,
  onFilterChange,
  onSearch,
  onReset,
  activeFilterCount,
}: VenueHeroSearchProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [mobileActiveCategory, setMobileActiveCategory] = useState<keyof VenueFilterState>("location");

  // Filter input states for interactive search
  const [locationSearch, setLocationSearch] = useState("");
  const [venueTypeSearch, setVenueTypeSearch] = useState("");
  const [budgetSearch, setBudgetSearch] = useState("");
  const [customGuestCount, setCustomGuestCount] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const guestInputRef = useRef<HTMLInputElement>(null);
  const venueTypeInputRef = useRef<HTMLInputElement>(null);
  const budgetInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click or escape
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveDropdown(null);
        setIsMobileModalOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Focus search input when location or guests or venueType dropdown opens
  useEffect(() => {
    if (activeDropdown === "location") {
      setTimeout(() => locationInputRef.current?.focus(), 80);
    } else if (activeDropdown === "guests") {
      setTimeout(() => guestInputRef.current?.focus(), 80);
    } else if (activeDropdown === "venueType") {
      setTimeout(() => venueTypeInputRef.current?.focus(), 80);
    } else if (activeDropdown === "budget") {
      setTimeout(() => budgetInputRef.current?.focus(), 80);
    }
  }, [activeDropdown]);

  // Dynamic matching for location based on letters entered (fuzzy / substring anywhere)
  const filteredLocations = useMemo(() => {
    const query = locationSearch.trim().toLowerCase();
    if (!query) return POPULAR_LOCATIONS;
    return POPULAR_LOCATIONS.filter((loc) =>
      loc.toLowerCase().includes(query)
    );
  }, [locationSearch]);

  // Dynamic matching for venue type based on letters entered
  const filteredVenueTypes = useMemo(() => {
    const query = venueTypeSearch.trim().toLowerCase();
    if (!query) return VENUE_TYPE_OPTIONS;
    return VENUE_TYPE_OPTIONS.filter((type) =>
      type.toLowerCase().includes(query)
    );
  }, [venueTypeSearch]);

  // Dynamic matching for budget options based on letters entered
  const filteredBudgets = useMemo(() => {
    const query = budgetSearch.trim().toLowerCase();
    if (!query) return BUDGET_OPTIONS;
    return BUDGET_OPTIONS.filter((b) =>
      b.toLowerCase().includes(query)
    );
  }, [budgetSearch]);

  const getChipDisplayValue = (id: keyof VenueFilterState) => {
    const val = filters[id];
    if (!val || val.startsWith("All") || val.startsWith("Any")) {
      return null;
    }
    return val;
  };

  const handleSelectOption = (id: keyof VenueFilterState, option: string) => {
    onFilterChange(id, option);
    setActiveDropdown(null);
  };

  const handleCustomGuestSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanNum = customGuestCount.replace(/\D/g, "");
    if (cleanNum) {
      onFilterChange("guests", `${cleanNum} Guests`);
      setCustomGuestCount("");
      setActiveDropdown(null);
    }
  };

  const handleLocationSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (locationSearch.trim()) {
      onFilterChange("location", locationSearch.trim());
      setLocationSearch("");
      setActiveDropdown(null);
    }
  };

  const openMobileWithCategory = (cat: keyof VenueFilterState) => {
    setMobileActiveCategory(cat);
    setIsMobileModalOpen(true);
  };

  const handleExploreClick = () => {
    setActiveDropdown(null);
    setIsMobileModalOpen(false);
    onSearch();
  };

  return (
    <div ref={containerRef} className={`relative w-full max-w-5xl mx-auto transition-all ${activeDropdown ? "z-[999]" : "z-30"}`}>
      
      {/* ─────────────────────────────────────────────────────────────
          DESKTOP & TABLET FILTER BAR (md+)
      ────────────────────────────────────────────────────────────── */}
      <div className="hidden md:flex bg-white/95 backdrop-blur-xl border border-[#C5A880]/30 rounded-full p-2.5 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.07)] hover:shadow-[0_16px_50px_-10px_rgba(197,168,128,0.22)] transition-all duration-300 items-center justify-between gap-1.5 relative">
        
        {/* 1. LOCATION FILTER */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setActiveDropdown(activeDropdown === "location" ? null : "location")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-left transition-all duration-200 outline-none ${
              activeDropdown === "location"
                ? "bg-[#FAF5ED] ring-2 ring-[#C5A880] shadow-sm"
                : getChipDisplayValue("location")
                ? "bg-[#FAF5ED] border border-[#C5A880]/50 text-neutral-900"
                : "hover:bg-[#FBF8F4] text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <MapPin className={`w-4 h-4 shrink-0 ${getChipDisplayValue("location") || activeDropdown === "location" ? "text-[#8B263E]" : "text-[#C5A880]"}`} />
            <div className="flex flex-col items-start leading-tight">
              <span className="text-[9px] uppercase font-bold tracking-wider text-neutral-400">
                Location
              </span>
              <span className={`text-[12px] xl:text-[13px] font-semibold truncate max-w-[95px] xl:max-w-[125px] ${
                getChipDisplayValue("location") ? "text-[#8B263E]" : "text-neutral-800"
              }`}>
                {getChipDisplayValue("location") || "Any Location"}
              </span>
            </div>
          </button>

          {/* Location Dropdown Popover */}
          <AnimatePresence>
            {activeDropdown === "location" && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.96 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className="absolute left-0 top-full mt-2 w-80 max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.22)] border border-[#C5A880]/30 p-3 z-[1000]"
              >
                {/* Search Input */}
                <form onSubmit={handleLocationSearchSubmit} className="relative mb-2">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    ref={locationInputRef}
                    type="text"
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                    placeholder="Type city or area (e.g. Hyd, Banjara)..."
                    className="w-full pl-8 pr-7 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-800 focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]"
                  />
                  {locationSearch && (
                    <button
                      type="button"
                      onClick={() => setLocationSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-0.5"
                      aria-label="Clear location search"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </form>

                {/* Clear / All Option */}
                <button
                  type="button"
                  onClick={() => handleSelectOption("location", "All Locations")}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-lg font-medium transition-colors text-left mb-1 ${
                    !getChipDisplayValue("location")
                      ? "bg-[#FAF5ED] text-[#8B263E] font-bold"
                      : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800"
                  }`}
                >
                  <span>All Locations (Hyderabad)</span>
                  {!getChipDisplayValue("location") && <Check className="w-3 h-3 text-[#8B263E]" />}
                </button>

                <div className="h-px bg-neutral-100 my-1" />

                {/* Matching Locations List */}
                <div className="max-h-64 overflow-y-auto space-y-0.5 pr-1 scrollbar-thin">
                  {locationSearch.trim() && !filteredLocations.some(l => l.toLowerCase() === locationSearch.trim().toLowerCase()) && (
                    <button
                      type="button"
                      onClick={() => handleSelectOption("location", locationSearch.trim())}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg font-semibold bg-[#8B263E]/5 text-[#8B263E] hover:bg-[#8B263E]/10 transition-colors text-left"
                    >
                      <span className="truncate">Select &quot;{locationSearch.trim()}&quot;</span>
                      <ArrowRight className="w-3 h-3 shrink-0" />
                    </button>
                  )}

                  {filteredLocations.map((loc) => {
                    const isSelected = filters.location === loc;
                    return (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => handleSelectOption("location", loc)}
                        className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-lg font-medium transition-colors text-left ${
                          isSelected
                            ? "bg-[#FAF5ED] text-[#8B263E] font-bold"
                            : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                        }`}
                      >
                        <span className="truncate">{loc}</span>
                        {isSelected && <Check className="w-3 h-3 text-[#8B263E] shrink-0" />}
                      </button>
                    );
                  })}

                  {filteredLocations.length === 0 && (
                    <div className="text-center py-6 px-3">
                      <p className="text-xs text-neutral-500 font-medium">No matching locations found for &quot;{locationSearch}&quot;</p>
                      <button
                        type="button"
                        onClick={() => setLocationSearch("")}
                        className="mt-2 text-xs text-[#8B263E] font-bold hover:underline"
                      >
                        Show all locations
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 2. GUESTS FILTER */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setActiveDropdown(activeDropdown === "guests" ? null : "guests")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-left transition-all duration-200 outline-none ${
              activeDropdown === "guests"
                ? "bg-[#FAF5ED] ring-2 ring-[#C5A880] shadow-sm"
                : getChipDisplayValue("guests")
                ? "bg-[#FAF5ED] border border-[#C5A880]/50 text-neutral-900"
                : "hover:bg-[#FBF8F4] text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <Users className={`w-4 h-4 shrink-0 ${getChipDisplayValue("guests") || activeDropdown === "guests" ? "text-[#8B263E]" : "text-[#C5A880]"}`} />
            <div className="flex flex-col items-start leading-tight">
              <span className="text-[9px] uppercase font-bold tracking-wider text-neutral-400">
                Guests
              </span>
              <span className={`text-[12px] xl:text-[13px] font-semibold truncate max-w-[95px] xl:max-w-[125px] ${
                getChipDisplayValue("guests") ? "text-[#8B263E]" : "text-neutral-800"
              }`}>
                {getChipDisplayValue("guests") || "Any Guests"}
              </span>
            </div>
          </button>

          {/* Guests Dropdown Popover */}
          <AnimatePresence>
            {activeDropdown === "guests" && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.96 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className="absolute left-0 top-full mt-2 w-72 max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.22)] border border-[#C5A880]/30 p-3 z-[1000]"
              >
                {/* Numeric Guest Input */}
                <form onSubmit={handleCustomGuestSubmit} className="mb-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
                    Enter Exact Guest Count
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      ref={guestInputRef}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={customGuestCount}
                      onChange={(e) => setCustomGuestCount(e.target.value.replace(/\D/g, ""))}
                      placeholder="e.g. 350"
                      className="flex-1 px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-800 focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]"
                    />
                    <button
                      type="submit"
                      disabled={!customGuestCount}
                      className="px-3 py-1.5 bg-[#8B263E] disabled:bg-neutral-200 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      Set
                    </button>
                  </div>
                </form>

                {/* Clear / Any Option */}
                <button
                  type="button"
                  onClick={() => handleSelectOption("guests", "Any Guests")}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-lg font-medium transition-colors text-left mb-1 ${
                    !getChipDisplayValue("guests")
                      ? "bg-[#FAF5ED] text-[#8B263E] font-bold"
                      : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800"
                  }`}
                >
                  <span>Any Guests</span>
                  {!getChipDisplayValue("guests") && <Check className="w-3 h-3 text-[#8B263E]" />}
                </button>

                <div className="h-px bg-neutral-100 my-1.5" />
                <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-3 py-1">
                  Popular Guest Ranges
                </div>

                {/* Preset Options */}
                <div className="space-y-0.5 max-h-56 overflow-y-auto">
                  {GUEST_OPTIONS.map((opt) => {
                    const isSelected = filters.guests === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleSelectOption("guests", opt)}
                        className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-lg font-medium transition-colors text-left ${
                          isSelected
                            ? "bg-[#FAF5ED] text-[#8B263E] font-bold"
                            : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                        }`}
                      >
                        <span>{opt}</span>
                        {isSelected && <Check className="w-3 h-3 text-[#8B263E]" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3. BUDGET FILTER */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setActiveDropdown(activeDropdown === "budget" ? null : "budget")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-left transition-all duration-200 outline-none ${
              activeDropdown === "budget"
                ? "bg-[#FAF5ED] ring-2 ring-[#C5A880] shadow-sm"
                : getChipDisplayValue("budget")
                ? "bg-[#FAF5ED] border border-[#C5A880]/50 text-neutral-900"
                : "hover:bg-[#FBF8F4] text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <IndianRupee className={`w-4 h-4 shrink-0 ${getChipDisplayValue("budget") || activeDropdown === "budget" ? "text-[#8B263E]" : "text-[#C5A880]"}`} />
            <div className="flex flex-col items-start leading-tight">
              <span className="text-[9px] uppercase font-bold tracking-wider text-neutral-400">
                Budget
              </span>
              <span className={`text-[12px] xl:text-[13px] font-semibold truncate max-w-[95px] xl:max-w-[125px] ${
                getChipDisplayValue("budget") ? "text-[#8B263E]" : "text-neutral-800"
              }`}>
                {getChipDisplayValue("budget") || "Any Budget"}
              </span>
            </div>
          </button>

          {/* Budget Dropdown Popover */}
          <AnimatePresence>
            {activeDropdown === "budget" && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.96 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className="absolute left-0 top-full mt-2 w-72 max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.22)] border border-[#C5A880]/30 p-3 z-[1000]"
              >
                {/* Search Input for Budget */}
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    ref={budgetInputRef}
                    type="text"
                    value={budgetSearch}
                    onChange={(e) => setBudgetSearch(e.target.value)}
                    placeholder="Search budget (e.g. 1000, 2500)..."
                    className="w-full pl-8 pr-7 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-800 focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]"
                  />
                  {budgetSearch && (
                    <button
                      type="button"
                      onClick={() => setBudgetSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectOption("budget", "Any Budget")}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-lg font-medium transition-colors text-left mb-1 ${
                    !getChipDisplayValue("budget")
                      ? "bg-[#FAF5ED] text-[#8B263E] font-bold"
                      : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800"
                  }`}
                >
                  <span>Any Budget</span>
                  {!getChipDisplayValue("budget") && <Check className="w-3 h-3 text-[#8B263E]" />}
                </button>

                <div className="h-px bg-neutral-100 my-1" />

                <div className="space-y-0.5 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                  {filteredBudgets.map((opt) => {
                    const isSelected = filters.budget === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleSelectOption("budget", opt)}
                        className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-lg font-medium transition-colors text-left ${
                          isSelected
                            ? "bg-[#FAF5ED] text-[#8B263E] font-bold"
                            : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                        }`}
                      >
                        <span>{opt}</span>
                        {isSelected && <Check className="w-3 h-3 text-[#8B263E]" />}
                      </button>
                    );
                  })}

                  {filteredBudgets.length === 0 && (
                    <div className="text-center py-5 px-2">
                      <p className="text-xs text-neutral-500 font-medium">No budget options matching &quot;{budgetSearch}&quot;</p>
                      <button
                        type="button"
                        onClick={() => setBudgetSearch("")}
                        className="mt-2 text-xs text-[#8B263E] font-bold hover:underline"
                      >
                        Show all budget options
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 4. VENUE TYPE FILTER */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setActiveDropdown(activeDropdown === "venueType" ? null : "venueType")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-left transition-all duration-200 outline-none ${
              activeDropdown === "venueType"
                ? "bg-[#FAF5ED] ring-2 ring-[#C5A880] shadow-sm"
                : getChipDisplayValue("venueType")
                ? "bg-[#FAF5ED] border border-[#C5A880]/50 text-neutral-900"
                : "hover:bg-[#FBF8F4] text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <Home className={`w-4 h-4 shrink-0 ${getChipDisplayValue("venueType") || activeDropdown === "venueType" ? "text-[#8B263E]" : "text-[#C5A880]"}`} />
            <div className="flex flex-col items-start leading-tight">
              <span className="text-[9px] uppercase font-bold tracking-wider text-neutral-400">
                Venue Type
              </span>
              <span className={`text-[12px] xl:text-[13px] font-semibold truncate max-w-[95px] xl:max-w-[125px] ${
                getChipDisplayValue("venueType") ? "text-[#8B263E]" : "text-neutral-800"
              }`}>
                {getChipDisplayValue("venueType") || "All Types"}
              </span>
            </div>
          </button>

          {/* Venue Type Dropdown Popover */}
          <AnimatePresence>
            {activeDropdown === "venueType" && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.96 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.22)] border border-[#C5A880]/30 p-3 z-[1000]"
              >
                {/* Search Input for Venue Type */}
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    ref={venueTypeInputRef}
                    type="text"
                    value={venueTypeSearch}
                    onChange={(e) => setVenueTypeSearch(e.target.value)}
                    placeholder="Search venue type (e.g. Banquet, Palace)..."
                    className="w-full pl-8 pr-7 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-800 focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]"
                  />
                  {venueTypeSearch && (
                    <button
                      type="button"
                      onClick={() => setVenueTypeSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectOption("venueType", "All Types")}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-lg font-medium transition-colors text-left mb-1 ${
                    !getChipDisplayValue("venueType")
                      ? "bg-[#FAF5ED] text-[#8B263E] font-bold"
                      : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800"
                  }`}
                >
                  <span>All Venue Types</span>
                  {!getChipDisplayValue("venueType") && <Check className="w-3 h-3 text-[#8B263E]" />}
                </button>

                <div className="h-px bg-neutral-100 my-1" />

                <div className="space-y-0.5 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                  {filteredVenueTypes.map((opt) => {
                    const isSelected = filters.venueType === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleSelectOption("venueType", opt)}
                        className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-lg font-medium transition-colors text-left ${
                          isSelected
                            ? "bg-[#FAF5ED] text-[#8B263E] font-bold"
                            : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                        }`}
                      >
                        <span>{opt}</span>
                        {isSelected && <Check className="w-3 h-3 text-[#8B263E]" />}
                      </button>
                    );
                  })}

                  {filteredVenueTypes.length === 0 && (
                    <div className="text-center py-5 px-2">
                      <p className="text-xs text-neutral-500 font-medium">No venue types matching &quot;{venueTypeSearch}&quot;</p>
                      <button
                        type="button"
                        onClick={() => setVenueTypeSearch("")}
                        className="mt-2 text-xs text-[#8B263E] font-bold hover:underline"
                      >
                        Show all types
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 5. INDOOR / OUTDOOR FILTER */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setActiveDropdown(activeDropdown === "space" ? null : "space")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-left transition-all duration-200 outline-none ${
              activeDropdown === "space"
                ? "bg-[#FAF5ED] ring-2 ring-[#C5A880] shadow-sm"
                : getChipDisplayValue("space")
                ? "bg-[#FAF5ED] border border-[#C5A880]/50 text-neutral-900"
                : "hover:bg-[#FBF8F4] text-neutral-600 hover:text-neutral-900"
            }`}
          >
            <Sun className={`w-4 h-4 shrink-0 ${getChipDisplayValue("space") || activeDropdown === "space" ? "text-[#8B263E]" : "text-[#C5A880]"}`} />
            <div className="flex flex-col items-start leading-tight">
              <span className="text-[9px] uppercase font-bold tracking-wider text-neutral-400">
                Space
              </span>
              <span className={`text-[12px] xl:text-[13px] font-semibold truncate max-w-[95px] xl:max-w-[125px] ${
                getChipDisplayValue("space") ? "text-[#8B263E]" : "text-neutral-800"
              }`}>
                {getChipDisplayValue("space") || "All Spaces"}
              </span>
            </div>
          </button>

          {/* Space Dropdown Popover */}
          <AnimatePresence>
            {activeDropdown === "space" && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.96 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] border border-[#C5A880]/30 p-3 z-50"
              >
                <div className="px-3 py-1 border-b border-neutral-100 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5A880]">
                    Setting / Ambiance
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectOption("space", "All Spaces")}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-lg font-medium transition-colors text-left mb-1 ${
                    !getChipDisplayValue("space")
                      ? "bg-[#FAF5ED] text-[#8B263E] font-bold"
                      : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800"
                  }`}
                >
                  <span>All Spaces</span>
                  {!getChipDisplayValue("space") && <Check className="w-3 h-3 text-[#8B263E]" />}
                </button>

                <div className="space-y-0.5">
                  {SPACE_OPTIONS.map((opt) => {
                    const isSelected = filters.space === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleSelectOption("space", opt)}
                        className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-lg font-medium transition-colors text-left ${
                          isSelected
                            ? "bg-[#FAF5ED] text-[#8B263E] font-bold"
                            : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                        }`}
                      >
                        <span>{opt}</span>
                        {isSelected && <Check className="w-3 h-3 text-[#8B263E]" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 6. RESET BUTTON (if filters active) */}
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            title="Reset Filters"
            className="p-2 text-neutral-400 hover:text-[#8B263E] hover:bg-neutral-100 rounded-full transition-colors shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}

        {/* 7. EXPLORE BUTTON */}
        <button
          type="button"
          onClick={handleExploreClick}
          className="bg-gradient-to-r from-[#8B263E] to-[#6e1c2f] hover:from-[#761e33] hover:to-[#591424] text-white px-5 xl:px-6 py-2.5 rounded-full flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(139,38,62,0.3)] hover:shadow-[0_6px_20px_rgba(139,38,62,0.45)] transition-all duration-300 active:scale-[0.98] shrink-0"
        >
          <Search className="w-3.5 h-3.5 text-white" />
          <span className="text-xs font-bold uppercase tracking-widest">
            Explore
          </span>
          {activeFilterCount > 0 && (
            <span className="bg-white/25 text-white px-1.5 py-0.2 rounded-full text-[10px] font-black">
              {activeFilterCount}
            </span>
          )}
        </button>

      </div>

      {/* ─────────────────────────────────────────────────────────────
          MOBILE INTERACTIVE FILTER BAR (< md)
      ────────────────────────────────────────────────────────────── */}
      <div className="flex md:hidden flex-col gap-2 bg-white/95 backdrop-blur-xl border border-[#C5A880]/30 rounded-2xl p-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
        
        {/* Horizontal scrollable quick chips */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-1 px-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <button
            type="button"
            onClick={() => openMobileWithCategory("location")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              getChipDisplayValue("location")
                ? "bg-[#FAF5ED] text-[#8B263E] border border-[#C5A880]/50"
                : "bg-neutral-100 text-neutral-700"
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>{getChipDisplayValue("location") || "Location"}</span>
          </button>

          <button
            type="button"
            onClick={() => openMobileWithCategory("guests")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              getChipDisplayValue("guests")
                ? "bg-[#FAF5ED] text-[#8B263E] border border-[#C5A880]/50"
                : "bg-neutral-100 text-neutral-700"
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>{getChipDisplayValue("guests") || "Guests"}</span>
          </button>

          <button
            type="button"
            onClick={() => openMobileWithCategory("budget")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              getChipDisplayValue("budget")
                ? "bg-[#FAF5ED] text-[#8B263E] border border-[#C5A880]/50"
                : "bg-neutral-100 text-neutral-700"
            }`}
          >
            <IndianRupee className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>{getChipDisplayValue("budget") || "Budget"}</span>
          </button>

          <button
            type="button"
            onClick={() => openMobileWithCategory("venueType")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              getChipDisplayValue("venueType")
                ? "bg-[#FAF5ED] text-[#8B263E] border border-[#C5A880]/50"
                : "bg-neutral-100 text-neutral-700"
            }`}
          >
            <Home className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>{getChipDisplayValue("venueType") || "Venue Type"}</span>
          </button>

          <button
            type="button"
            onClick={() => openMobileWithCategory("space")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              getChipDisplayValue("space")
                ? "bg-[#FAF5ED] text-[#8B263E] border border-[#C5A880]/50"
                : "bg-neutral-100 text-neutral-700"
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>{getChipDisplayValue("space") || "Space"}</span>
          </button>
        </div>

        {/* Action Row */}
        <div className="flex items-center gap-2 pt-1 border-t border-neutral-100">
          <button
            type="button"
            onClick={() => setIsMobileModalOpen(true)}
            className="flex-1 py-2.5 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#8B263E]" />
            <span>All Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 bg-[#8B263E] text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={handleExploreClick}
            className="flex-[1.2] py-2.5 px-4 rounded-xl bg-[#8B263E] hover:bg-[#6e1c2f] text-white text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Explore</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MOBILE FULL FILTER SHEET MODAL
      ────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-end justify-center bg-black/80 backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileModalOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="w-full bg-white rounded-t-3xl flex flex-col max-h-[90vh] shadow-[0_-8px_40px_rgba(0,0,0,0.2)] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-white shrink-0">
                <div>
                  <h3 className="text-lg font-serif font-bold text-neutral-900">
                    Filter Venues
                  </h3>
                  {activeFilterCount > 0 && (
                    <p className="text-[10px] uppercase font-bold tracking-wider text-[#8B263E]">
                      {activeFilterCount} Active Filters
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setIsMobileModalOpen(false)}
                  className="p-2 -mr-1.5 bg-neutral-100 rounded-full text-neutral-500 hover:text-neutral-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Tabs for Categories */}
              <div
                className="flex items-center gap-1.5 overflow-x-auto px-5 py-2.5 border-b border-neutral-100 bg-[#FAF9F6] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] shrink-0"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {(
                  [
                    { id: "location", label: "Location", icon: MapPin },
                    { id: "guests", label: "Guests", icon: Users },
                    { id: "budget", label: "Budget", icon: IndianRupee },
                    { id: "venueType", label: "Type", icon: Home },
                    { id: "space", label: "Space", icon: Sun },
                  ] as const
                ).map((cat) => {
                  const Icon = cat.icon;
                  const isActive = mobileActiveCategory === cat.id;
                  const hasValue = !!getChipDisplayValue(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setMobileActiveCategory(cat.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                        isActive
                          ? "bg-[#8B263E] text-white shadow-sm"
                          : hasValue
                          ? "bg-[#FAF5ED] text-[#8B263E] border border-[#C5A880]/50"
                          : "bg-white text-neutral-600 border border-neutral-200"
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{cat.label}</span>
                      {hasValue && !isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8B263E]" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Category Active Content Body */}
              <div className="flex-1 overflow-y-auto p-5">
                {/* 1. LOCATION CATEGORY */}
                {mobileActiveCategory === "location" && (
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                      Search By City or Area
                    </div>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="text"
                        value={locationSearch}
                        onChange={(e) => setLocationSearch(e.target.value)}
                        placeholder="Type location (e.g. Hyd, Gachibowli)..."
                        className="w-full pl-9 pr-8 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-[#C5A880]"
                      />
                      {locationSearch && (
                        <button
                          type="button"
                          onClick={() => setLocationSearch("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onFilterChange("location", "All Locations")}
                      className={`w-full py-2.5 px-3.5 rounded-xl text-left text-xs font-bold flex items-center justify-between ${
                        !getChipDisplayValue("location")
                          ? "bg-[#FAF5ED] text-[#8B263E] border border-[#C5A880]/50"
                          : "bg-neutral-50 text-neutral-700"
                      }`}
                    >
                      <span>All Locations (Hyderabad)</span>
                      {!getChipDisplayValue("location") && <Check className="w-4 h-4 text-[#8B263E]" />}
                    </button>

                    <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                      {locationSearch.trim() && !filteredLocations.some(l => l.toLowerCase() === locationSearch.trim().toLowerCase()) && (
                        <button
                          type="button"
                          onClick={() => onFilterChange("location", locationSearch.trim())}
                          className="w-full py-2.5 px-3.5 rounded-xl text-left text-xs font-bold bg-[#8B263E]/5 text-[#8B263E] flex items-center justify-between"
                        >
                          <span>Select &quot;{locationSearch.trim()}&quot;</span>
                          <Check className="w-4 h-4" />
                        </button>
                      )}

                      {filteredLocations.map((loc) => {
                        const isSelected = filters.location === loc;
                        return (
                          <button
                            key={loc}
                            type="button"
                            onClick={() => onFilterChange("location", loc)}
                            className={`w-full py-2.5 px-3.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                              isSelected
                                ? "bg-[#FAF5ED] text-[#8B263E] font-bold border border-[#C5A880]/50"
                                : "bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
                            }`}
                          >
                            <span>{loc}</span>
                            {isSelected && <Check className="w-4 h-4 text-[#8B263E]" />}
                          </button>
                        );
                      })}

                      {filteredLocations.length === 0 && (
                        <div className="text-center py-6 px-3">
                          <p className="text-xs text-neutral-500 font-medium">No matching locations found for &quot;{locationSearch}&quot;</p>
                          <button
                            type="button"
                            onClick={() => setLocationSearch("")}
                            className="mt-2 text-xs text-[#8B263E] font-bold hover:underline"
                          >
                            Show all locations
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. GUESTS CATEGORY */}
                {mobileActiveCategory === "guests" && (
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                        Enter Exact Number
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={customGuestCount}
                          onChange={(e) => setCustomGuestCount(e.target.value.replace(/\D/g, ""))}
                          placeholder="e.g. 250"
                          className="flex-1 px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-[#C5A880]"
                        />
                        <button
                          type="button"
                          disabled={!customGuestCount}
                          onClick={() => {
                            if (customGuestCount) {
                              onFilterChange("guests", `${customGuestCount} Guests`);
                              setCustomGuestCount("");
                            }
                          }}
                          className="px-5 py-2.5 bg-[#8B263E] disabled:bg-neutral-200 text-white rounded-xl text-xs font-bold"
                        >
                          Set
                        </button>
                      </div>
                    </div>

                    <div className="h-px bg-neutral-100" />

                    <div>
                      <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                        Or Choose Guest Range
                      </div>
                      <div className="grid grid-cols-1 gap-1.5">
                        <button
                          type="button"
                          onClick={() => onFilterChange("guests", "Any Guests")}
                          className={`py-2.5 px-3.5 rounded-xl text-left text-xs font-bold flex items-center justify-between ${
                            !getChipDisplayValue("guests")
                              ? "bg-[#FAF5ED] text-[#8B263E] border border-[#C5A880]/50"
                              : "bg-neutral-50 text-neutral-700"
                          }`}
                        >
                          <span>Any Guests</span>
                          {!getChipDisplayValue("guests") && <Check className="w-4 h-4 text-[#8B263E]" />}
                        </button>

                        {GUEST_OPTIONS.map((opt) => {
                          const isSelected = filters.guests === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => onFilterChange("guests", opt)}
                              className={`py-2.5 px-3.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between ${
                                isSelected
                                  ? "bg-[#FAF5ED] text-[#8B263E] font-bold border border-[#C5A880]/50"
                                  : "bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
                              }`}
                            >
                              <span>{opt}</span>
                              {isSelected && <Check className="w-4 h-4 text-[#8B263E]" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. BUDGET CATEGORY */}
                {mobileActiveCategory === "budget" && (
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                      Budget Per Plate
                    </div>
                    {/* Search input for budget in mobile */}
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="text"
                        value={budgetSearch}
                        onChange={(e) => setBudgetSearch(e.target.value)}
                        placeholder="Search budget (e.g. 1000, 2000)..."
                        className="w-full pl-9 pr-8 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-[#C5A880]"
                      />
                      {budgetSearch && (
                        <button
                          type="button"
                          onClick={() => setBudgetSearch("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-1.5 max-h-60 overflow-y-auto">
                      <button
                        type="button"
                        onClick={() => onFilterChange("budget", "Any Budget")}
                        className={`py-2.5 px-3.5 rounded-xl text-left text-xs font-bold flex items-center justify-between ${
                          !getChipDisplayValue("budget")
                            ? "bg-[#FAF5ED] text-[#8B263E] border border-[#C5A880]/50"
                            : "bg-neutral-50 text-neutral-700"
                        }`}
                      >
                        <span>Any Budget</span>
                        {!getChipDisplayValue("budget") && <Check className="w-4 h-4 text-[#8B263E]" />}
                      </button>

                      {filteredBudgets.map((opt) => {
                        const isSelected = filters.budget === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => onFilterChange("budget", opt)}
                            className={`py-2.5 px-3.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between ${
                              isSelected
                                ? "bg-[#FAF5ED] text-[#8B263E] font-bold border border-[#C5A880]/50"
                                : "bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
                            }`}
                          >
                            <span>{opt}</span>
                            {isSelected && <Check className="w-4 h-4 text-[#8B263E]" />}
                          </button>
                        );
                      })}

                      {filteredBudgets.length === 0 && (
                        <div className="text-center py-5 px-2">
                          <p className="text-xs text-neutral-500 font-medium">No budget matching &quot;{budgetSearch}&quot;</p>
                          <button
                            type="button"
                            onClick={() => setBudgetSearch("")}
                            className="mt-2 text-xs text-[#8B263E] font-bold hover:underline"
                          >
                            Show all budget options
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. VENUE TYPE CATEGORY */}
                {mobileActiveCategory === "venueType" && (
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                      Select Venue Type
                    </div>
                    {/* Search input for venue type in mobile */}
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="text"
                        value={venueTypeSearch}
                        onChange={(e) => setVenueTypeSearch(e.target.value)}
                        placeholder="Search type (e.g. Banquet, Resort)..."
                        className="w-full pl-9 pr-8 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:border-[#C5A880]"
                      />
                      {venueTypeSearch && (
                        <button
                          type="button"
                          onClick={() => setVenueTypeSearch("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                      <button
                        type="button"
                        onClick={() => onFilterChange("venueType", "All Types")}
                        className={`col-span-2 py-2.5 px-3.5 rounded-xl text-left text-xs font-bold flex items-center justify-between ${
                          !getChipDisplayValue("venueType")
                            ? "bg-[#FAF5ED] text-[#8B263E] border border-[#C5A880]/50"
                            : "bg-neutral-50 text-neutral-700"
                        }`}
                      >
                        <span>All Types</span>
                        {!getChipDisplayValue("venueType") && <Check className="w-4 h-4 text-[#8B263E]" />}
                      </button>

                      {filteredVenueTypes.map((opt) => {
                        const isSelected = filters.venueType === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => onFilterChange("venueType", opt)}
                            className={`py-2.5 px-3 rounded-xl text-left text-xs font-semibold flex items-center justify-between ${
                              isSelected
                                ? "bg-[#FAF5ED] text-[#8B263E] font-bold border border-[#C5A880]/50"
                                : "bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
                            }`}
                          >
                            <span className="truncate">{opt}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#8B263E] shrink-0" />}
                          </button>
                        );
                      })}

                      {filteredVenueTypes.length === 0 && (
                        <div className="col-span-2 text-center py-5 px-2">
                          <p className="text-xs text-neutral-500 font-medium">No venue type matching &quot;{venueTypeSearch}&quot;</p>
                          <button
                            type="button"
                            onClick={() => setVenueTypeSearch("")}
                            className="mt-2 text-xs text-[#8B263E] font-bold hover:underline"
                          >
                            Show all types
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 5. SPACE CATEGORY */}
                {mobileActiveCategory === "space" && (
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                      Setting / Ambiance
                    </div>
                    <div className="grid grid-cols-1 gap-1.5">
                      <button
                        type="button"
                        onClick={() => onFilterChange("space", "All Spaces")}
                        className={`py-2.5 px-3.5 rounded-xl text-left text-xs font-bold flex items-center justify-between ${
                          !getChipDisplayValue("space")
                            ? "bg-[#FAF5ED] text-[#8B263E] border border-[#C5A880]/50"
                            : "bg-neutral-50 text-neutral-700"
                        }`}
                      >
                        <span>All Spaces</span>
                        {!getChipDisplayValue("space") && <Check className="w-4 h-4 text-[#8B263E]" />}
                      </button>

                      {SPACE_OPTIONS.map((opt) => {
                        const isSelected = filters.space === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => onFilterChange("space", opt)}
                            className={`py-2.5 px-3.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between ${
                              isSelected
                                ? "bg-[#FAF5ED] text-[#8B263E] font-bold border border-[#C5A880]/50"
                                : "bg-neutral-50 text-neutral-700 hover:bg-neutral-100"
                            }`}
                          >
                            <span>{opt}</span>
                            {isSelected && <Check className="w-4 h-4 text-[#8B263E]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Fixed Bottom Action Bar */}
              <div className="shrink-0 p-4 bg-white border-t border-gray-100 flex gap-2.5 safe-area-bottom">
                <button
                  type="button"
                  onClick={() => onReset()}
                  className="flex-[0.35] py-3 text-xs font-bold uppercase tracking-wider text-neutral-600 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition-colors"
                >
                  Clear All
                </button>
                <button
                  type="button"
                  onClick={handleExploreClick}
                  className="flex-[0.65] bg-[#8B263E] hover:bg-[#6e1c2f] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-[0.98]"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Apply &amp; Explore</span>
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
