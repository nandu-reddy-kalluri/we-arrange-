"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { VenueHeroSearch, VenueFilterState } from "./VenueHeroSearch";
import { QuickExperienceCards } from "./QuickExperienceCards";
import { PremiumVenueGrid } from "./PremiumVenueGrid";
import { featuredVenues } from "@/mock-data/venues";
import { spacing } from "@/styles";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Compass } from "lucide-react";

const INITIAL_FILTERS: VenueFilterState = {
  location: "All Locations",
  guests: "Any Guests",
  budget: "Any Budget",
  venueType: "All Types",
  space: "All Spaces",
};

export function VenueDiscoveryClient() {
  const [filters, setFilters] = useState<VenueFilterState>(INITIAL_FILTERS);

  const handleFilterChange = (key: keyof VenueFilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.location && !filters.location.startsWith("All")) count++;
    if (filters.guests && !filters.guests.startsWith("Any")) count++;
    if (filters.budget && !filters.budget.startsWith("Any")) count++;
    if (filters.venueType && !filters.venueType.startsWith("All")) count++;
    if (filters.space && !filters.space.startsWith("All")) count++;
    return count;
  }, [filters]);

  const filteredVenues = useMemo(() => {
    return featuredVenues.filter((venue) => {
      // Location filter
      if (filters.location && !filters.location.startsWith("All")) {
        const locLower = filters.location.toLowerCase();
        const venueLoc = `${venue.location} ${venue.city}`.toLowerCase();
        if (!venueLoc.includes(locLower)) {
          return false;
        }
      }

      // Guests / Capacity filter
      if (filters.guests && !filters.guests.startsWith("Any")) {
        if (filters.guests === "Up to 300 Guests" && venue.maxCapacity > 300) return false;
        if (filters.guests === "300 - 600 Guests" && (venue.maxCapacity < 300 || venue.maxCapacity > 600)) return false;
        if (filters.guests === "600 - 1000 Guests" && (venue.maxCapacity < 600 || venue.maxCapacity > 1000)) return false;
        if (filters.guests === "1000+ Guests" && venue.maxCapacity < 1000) return false;
      }

      // Budget filter
      if (filters.budget && !filters.budget.startsWith("Any")) {
        const price = venue.pricePerPlate || 0;
        if (filters.budget === "Under ₹500 / plate" && (price === 0 || price > 500)) return false;
        if (filters.budget === "₹500 - ₹1,000 / plate" && (price < 500 || price > 1000)) return false;
        if (filters.budget === "₹1,000 - ₹2,000 / plate" && (price < 1000 || price > 2000)) return false;
        if (filters.budget === "Custom / On Request" && price > 0) return false;
      }

      // Venue type filter
      if (filters.venueType && !filters.venueType.startsWith("All")) {
        if (venue.type !== filters.venueType) return false;
      }

      // Space filter
      if (filters.space && !filters.space.startsWith("All")) {
        if (venue.space !== filters.space) return false;
      }

      return true;
    });
  }, [filters]);

  const handleScrollToGrid = () => {
    const el = document.getElementById("venue-grid");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF7F2] relative pb-28">
      
      {/* 1. Hero Header & Unified Search */}
      <section className="pt-28 pb-12 md:pt-36 md:pb-16 px-4 sm:px-6 max-w-6xl mx-auto relative z-20">
        
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
        totalCount={featuredVenues.length}
        activeFilterCount={activeFilterCount}
        onReset={handleResetFilters}
      />

    </div>
  );
}
