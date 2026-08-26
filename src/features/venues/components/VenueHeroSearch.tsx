"use client";

import React, { useState, useRef, useEffect } from "react";
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

export const LOCATION_OPTIONS = [
  "All Locations",
  "Banjara Hills",
  "Jubilee Hills",
  "Madhapur",
  "Gachibowli",
  "KPHB",
  "Moinabad",
  "ORR",
  "MG Road",
  "Punjagutta",
  "Nagarjuna Sagar Rd",
];

export const GUEST_OPTIONS = [
  "Any Guests",
  "Up to 300 Guests",
  "300 - 600 Guests",
  "600 - 1000 Guests",
  "1000+ Guests",
];

export const BUDGET_OPTIONS = [
  "Any Budget",
  "Under ₹500 / plate",
  "₹500 - ₹1,000 / plate",
  "₹1,000 - ₹2,000 / plate",
  "Custom / On Request",
];

export const VENUE_TYPE_OPTIONS = [
  "All Types",
  "Banquet",
  "Hotel",
  "Convention",
  "Resort",
];

export const SPACE_OPTIONS = [
  "All Spaces",
  "Indoor",
  "Outdoor",
  "Poolside",
];

const SEARCH_CHIPS = [
  { id: "location" as const, label: "Location", icon: MapPin, options: LOCATION_OPTIONS },
  { id: "guests" as const, label: "Guests", icon: Users, options: GUEST_OPTIONS },
  { id: "budget" as const, label: "Budget", icon: IndianRupee, options: BUDGET_OPTIONS },
  { id: "venueType" as const, label: "Venue Type", icon: Home, options: VENUE_TYPE_OPTIONS },
  { id: "space" as const, label: "Indoor / Outdoor", icon: Sun, options: SPACE_OPTIONS },
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
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
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

  return (
    <div ref={containerRef} className="relative w-full max-w-5xl mx-auto z-30">
      {/* Desktop & Tablet Search Bar */}
      <div className="bg-white/95 backdrop-blur-xl border border-[#C5A880]/25 rounded-2xl md:rounded-full p-2 md:p-2.5 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_50px_-10px_rgba(197,168,128,0.2)] transition-all duration-300">
        
        {/* Mobile Condensed Search Trigger (< md) */}
        <div className="flex md:hidden items-center justify-between gap-2 p-1">
          <button
            type="button"
            onClick={() => setIsMobileModalOpen(true)}
            className="flex-1 flex items-center gap-2.5 px-3.5 py-2.5 bg-[#FAF7F2] rounded-xl text-left border border-[#E8D8BC]/40"
          >
            <MapPin className="w-4 h-4 text-[#8B263E] shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-black tracking-wider text-[#8B263E]">
                {activeFilterCount > 0 ? `${activeFilterCount} Filter${activeFilterCount > 1 ? "s" : ""} Active` : "Search & Filter"}
              </span>
              <span className="text-xs font-semibold text-neutral-800 truncate">
                {filters.location && !filters.location.startsWith("All") ? filters.location : "All Hyderabad"} • {filters.venueType && !filters.venueType.startsWith("All") ? filters.venueType : "All Types"}
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setIsMobileModalOpen(true)}
            className="p-3 bg-[#FAF5ED] rounded-xl border border-[#C5A880]/30 text-[#8B263E]"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onSearch}
            className="bg-[#8B263E] text-white p-3 rounded-xl shadow-md"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Desktop & Tablet Horizontal Chips (md+) */}
        <div className="hidden md:flex flex-row items-center justify-between gap-2">
          
          {/* Scrollable Chips row on desktop / tablet */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 px-1">
            {SEARCH_CHIPS.map((chip, idx) => {
              const Icon = chip.icon;
              const isSelected = !!getChipDisplayValue(chip.id);
              const isOpen = activeDropdown === chip.id;
              const isDesktopOnly = idx >= 3;

              return (
                <div key={chip.id} className={`relative ${isDesktopOnly ? "hidden lg:block" : "block"}`}>
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(isOpen ? null : chip.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 md:px-4 md:py-2.5 rounded-full text-left transition-all duration-200 whitespace-nowrap outline-none ${
                      isOpen
                        ? "bg-[#FAF5ED] ring-2 ring-[#C5A880] shadow-sm"
                        : isSelected
                        ? "bg-[#FAF5ED] border border-[#C5A880]/50 text-neutral-900"
                        : "hover:bg-[#FBF8F4] text-neutral-600 hover:text-neutral-900 border border-transparent"
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected || isOpen ? "text-[#8B263E]" : "text-[#C5A880]"}`} />
                    <div className="flex flex-col items-start leading-tight">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                        {chip.label}
                      </span>
                      <span className={`text-[12px] md:text-[13px] font-semibold truncate max-w-[110px] md:max-w-[130px] ${
                        isSelected ? "text-[#8B263E]" : "text-neutral-800"
                      }`}>
                        {getChipDisplayValue(chip.id) || "Select"}
                      </span>
                    </div>
                  </button>

                  {/* Dropdown Popover */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.96 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="absolute left-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-[#C5A880]/20 p-2 z-50 max-h-64 overflow-y-auto"
                      >
                        <div className="px-3 py-1.5 border-b border-neutral-100 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5A880]">
                            Select {chip.label}
                          </span>
                        </div>
                        {chip.options.map((option) => {
                          const isOptionActive =
                            (filters[chip.id] === option) ||
                            (!filters[chip.id] && (option.startsWith("All") || option.startsWith("Any")));
                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => handleSelectOption(chip.id, option)}
                              className={`w-full flex items-center justify-between px-3 py-2 text-[13px] rounded-xl font-medium transition-colors text-left ${
                                isOptionActive
                                  ? "bg-[#FAF5ED] text-[#8B263E] font-bold"
                                  : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                              }`}
                            >
                              <span className="truncate">{option}</span>
                              {isOptionActive && <Check className="w-3.5 h-3.5 text-[#8B263E] shrink-0 ml-1" />}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {/* Tablet More Filters Button */}
            <button
              type="button"
              onClick={() => setIsMobileModalOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-3.5 py-2 md:py-2.5 rounded-full bg-[#FAF7F2] hover:bg-[#F4EFE6] border border-[#C5A880]/30 text-neutral-700 font-semibold text-xs transition-colors shrink-0"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#8B263E]" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 bg-[#8B263E] text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 justify-end shrink-0">
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={onReset}
                title="Reset Filters"
                className="p-2.5 text-neutral-400 hover:text-[#8B263E] hover:bg-neutral-100 rounded-full transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onSearch}
              className="bg-gradient-to-r from-[#8B263E] to-[#6e1c2f] hover:from-[#761e33] hover:to-[#591424] text-white px-6 py-2.5 md:py-3 rounded-full flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(139,38,62,0.3)] hover:shadow-[0_6px_20px_rgba(139,38,62,0.45)] transition-all duration-300 active:scale-[0.98]"
            >
              <Search className="w-4 h-4 text-white" />
              <span className="text-xs font-bold uppercase tracking-widest">
                Explore
              </span>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Full Filter Sheet */}
      <AnimatePresence>
        {isMobileModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm lg:hidden p-0 sm:p-4"
            onClick={() => setIsMobileModalOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="w-full max-w-lg bg-white rounded-t-[32px] sm:rounded-[32px] p-6 flex flex-col gap-5 max-h-[88vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <div>
                  <h3 className="text-xl font-serif font-bold text-neutral-900">
                    Filter Venues
                  </h3>
                  <p className="text-xs text-neutral-500 font-medium mt-0.5">
                    Select your wedding celebration preferences
                  </p>
                </div>
                <button
                  onClick={() => setIsMobileModalOpen(false)}
                  className="p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-900 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Filter Options Accordions / Lists */}
              <div className="flex flex-col gap-5">
                {SEARCH_CHIPS.map((chip) => {
                  const Icon = chip.icon;
                  const currentVal = filters[chip.id];

                  return (
                    <div key={chip.id} className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-[#C5A880]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                          {chip.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {chip.options.map((opt) => {
                          const isSelected =
                            currentVal === opt ||
                            (!currentVal && (opt.startsWith("All") || opt.startsWith("Any")));
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => onFilterChange(chip.id, opt)}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                isSelected
                                  ? "bg-[#8B263E] text-white font-semibold shadow-sm"
                                  : "bg-[#FAF7F2] text-neutral-700 border border-[#E8D8BC]/50 hover:bg-[#F3ECE0]"
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons in Modal */}
              <div className="flex items-center gap-3 pt-4 border-t border-neutral-100 sticky bottom-0 bg-white pb-2">
                <button
                  type="button"
                  onClick={() => {
                    onReset();
                  }}
                  className="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-neutral-600 hover:text-neutral-900 bg-neutral-100 rounded-xl transition-colors"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileModalOpen(false);
                    onSearch();
                  }}
                  className="flex-2 w-2/3 bg-[#8B263E] hover:bg-[#6e1c2f] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors shadow-md text-center"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
