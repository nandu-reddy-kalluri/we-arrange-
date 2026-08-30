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
        <div className="flex md:hidden p-1 w-full">
          <button
            type="button"
            onClick={() => setIsMobileModalOpen(true)}
            className="w-full bg-[#8B263E] text-white py-3 px-4 rounded-xl shadow-md text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filter</span>
            {activeFilterCount > 0 && (
              <span className="bg-white text-[#8B263E] px-1.5 py-0.5 rounded-full text-[10px] ml-1">
                {activeFilterCount}
              </span>
            )}
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
            className="fixed inset-0 z-[120] flex items-end justify-center bg-black/80 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileModalOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="w-full bg-white rounded-t-3xl flex flex-col h-[85vh] shadow-[0_-8px_40px_rgba(0,0,0,0.16)] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 1. HEADER (Fixed) */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white shrink-0 z-10">
                <div>
                  <h3 className="text-xl font-serif font-bold text-neutral-900">
                    Filters
                  </h3>
                  {activeFilterCount > 0 && (
                    <p className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 mt-0.5">
                      {activeFilterCount} Selected
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setIsMobileModalOpen(false)}
                  className="p-2 -mr-2 bg-gray-50 rounded-full text-neutral-500 hover:text-neutral-900 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 2. SCROLLABLE CONTENT */}
              <div className="flex-grow overflow-y-auto px-6 pt-4 pb-20 flex flex-col gap-6">
                {SEARCH_CHIPS.map((chip) => {
                  const Icon = chip.icon;
                  const currentVal = filters[chip.id];

                  return (
                    <div key={chip.id} className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-[#C5A880]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                          {chip.label}
                        </span>
                      </div>
                      
                      {chip.id === "location" ? (
                        <div className="flex flex-col gap-2">
                          <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input
                              type="text"
                              placeholder="Where are you planning?"
                              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]"
                              onChange={(e) => {
                                // Simplified on-device search for the static options
                                const val = e.target.value;
                                // We are not updating state here for simplicity, but in a real app we'd filter the list below.
                              }}
                            />
                          </div>
                          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                            {chip.options.map((opt) => {
                              const isSelected =
                                currentVal === opt ||
                                (!currentVal && (opt.startsWith("All") || opt.startsWith("Any")));
                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => onFilterChange(chip.id, opt)}
                                  className={`flex-shrink-0 whitespace-nowrap px-3 py-2 rounded-xl text-[11px] font-bold transition-all ${
                                    isSelected
                                      ? "bg-[#C5A880] text-white shadow-sm"
                                      : "bg-[#FAF7F2] text-neutral-700 border border-[#E8D8BC]/50 hover:bg-[#F3ECE0]"
                                  }`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                          {chip.options.map((opt) => {
                            const isSelected =
                              currentVal === opt ||
                              (!currentVal && (opt.startsWith("All") || opt.startsWith("Any")));
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => onFilterChange(chip.id, opt)}
                                className={`flex-shrink-0 whitespace-nowrap px-3 py-2 rounded-xl text-[11px] font-bold transition-all ${
                                  isSelected
                                    ? "bg-gradient-to-r from-[#C5A880] to-[#E5C8A0] text-white border-transparent"
                                    : "bg-[#FAF7F2] text-neutral-700 border border-[#E8D8BC]/50 hover:bg-[#F3ECE0]"
                                }`}
                              >
                                {isSelected ? `✓ ${opt}` : opt}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 3. FIXED ACTION FOOTER */}
              <div className="shrink-0 p-5 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] flex gap-3 z-10 safe-area-bottom">
                <button
                  type="button"
                  onClick={() => onReset()}
                  className="flex-[0.4] py-3.5 text-xs font-bold uppercase tracking-widest text-neutral-600 hover:text-neutral-900 bg-neutral-100 rounded-xl transition-colors"
                >
                  Clear All
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileModalOpen(false);
                    onSearch();
                  }}
                  className="flex-[0.6] bg-gradient-to-r from-[#8B263E] to-[#A33B54] text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors shadow-[0_6px_18px_rgba(139,38,62,0.28)] flex items-center justify-center gap-1.5"
                >
                  <span>Apply Filters</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
