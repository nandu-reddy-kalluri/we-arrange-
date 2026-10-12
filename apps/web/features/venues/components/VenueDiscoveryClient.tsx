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
  location: "Any Location",
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
    if (filters.location && !filters.location.startsWith("All") && !filters.location.startsWith("Any")) count++;
    if (filters.guests && !filters.guests.startsWith("Any")) count++;
    if (filters.budget && !filters.budget.startsWith("Any")) count++;
    if (filters.venueType && !filters.venueType.startsWith("All") && !filters.venueType.startsWith("Any")) count++;
    if (filters.space && !filters.space.startsWith("All") && !filters.space.startsWith("Any")) count++;
    return count;
  }, [filters]);

  const filteredVenues = useMemo(() => {
    return featuredVenues.filter((venue) => {
      // 1. Location filter
      if (filters.location && !filters.location.startsWith("All") && !filters.location.startsWith("Any")) {
        const locLower = filters.location.trim().toLowerCase();
        // If "hyderabad" or "hyderabad city", match all Hyderabad venues
        if (locLower === "hyderabad" || locLower === "hyderabad city") {
          if (!venue.city.toLowerCase().includes("hyderabad")) return false;
        } else {
          const venueSearchTarget = `${venue.name} ${venue.location} ${venue.city}`.toLowerCase();
          if (!venueSearchTarget.includes(locLower)) {
            return false;
          }
        }
      }

      // 2. Guests / Capacity filter
      if (filters.guests && !filters.guests.startsWith("Any")) {
        // Parse venue capacity min/max
        const rangeParts = venue.capacityRange.match(/(\d+)\s*-\s*(\d+)/);
        const venueMin = rangeParts ? parseInt(rangeParts[1], 10) : 0;
        const venueMax = venue.maxCapacity || (rangeParts ? parseInt(rangeParts[2], 10) : 1000);

        if (filters.guests === "50–100 Guests" || filters.guests === "50-100 Guests") {
          // Venue accommodates intimate/small events
          if (venueMin > 150 || venueMax < 50) return false;
        } else if (filters.guests === "100–200 Guests" || filters.guests === "100-200 Guests") {
          if (venueMin > 250 || venueMax < 100) return false;
        } else if (filters.guests === "200–500 Guests" || filters.guests === "200-500 Guests") {
          if (venueMin > 500 || venueMax < 200) return false;
        } else if (filters.guests === "500–1000 Guests" || filters.guests === "500-1000 Guests") {
          if (venueMin > 1000 || venueMax < 500) return false;
        } else if (filters.guests === "1000+ Guests") {
          if (venueMax < 1000) return false;
        } else {
          // Custom manual number: e.g. "350 Guests"
          const parsed = parseInt(filters.guests.replace(/\D/g, ""), 10);
          if (!isNaN(parsed) && parsed > 0) {
            if (venueMax < parsed) return false;
          }
        }
      }

      // 3. Budget filter
      if (filters.budget && !filters.budget.startsWith("Any")) {
        const price = venue.pricePerPlate || 0;
        const isRequestOnly = !venue.pricePerPlate || venue.priceOnwards.toLowerCase().includes("request");

        if (filters.budget === "Price on Request") {
          if (!isRequestOnly) return false;
        } else if (filters.budget === "₹500 per plate") {
          if (isRequestOnly || price > 500) return false;
        } else if (filters.budget === "₹1,000 per plate") {
          if (isRequestOnly || price > 1000) return false;
        } else if (filters.budget === "₹1,500 per plate") {
          if (isRequestOnly || price > 1500) return false;
        } else if (filters.budget === "₹2,000 per plate") {
          if (isRequestOnly || price > 2000) return false;
        } else if (filters.budget === "₹2,500 per plate") {
          if (isRequestOnly || price > 2500) return false;
        } else if (filters.budget === "₹3,000+ per plate") {
          if (isRequestOnly || price < 3000) return false;
        }
      }

      // 4. Venue Type filter
      if (filters.venueType && !filters.venueType.startsWith("All") && !filters.venueType.startsWith("Any")) {
        const vType = filters.venueType;
        const fullDesc = `${venue.type} ${venue.name} ${venue.venueHighlights.join(" ")} ${venue.moodTags.join(" ")}`.toLowerCase();
        
        if (vType === "Banquet Hall") {
          if (venue.type !== "Banquet" && !fullDesc.includes("banquet")) return false;
        } else if (vType === "Wedding Hall") {
          if (venue.type !== "Banquet" && venue.type !== "Convention" && !fullDesc.includes("mandapam") && !fullDesc.includes("hall")) return false;
        } else if (vType === "Convention Centre") {
          if (venue.type !== "Convention" && !fullDesc.includes("convention")) return false;
        } else if (vType === "Hotel") {
          if (venue.type !== "Hotel" && !fullDesc.includes("hotel")) return false;
        } else if (vType === "Resort") {
          if (venue.type !== "Resort" && !fullDesc.includes("resort")) return false;
        } else if (vType === "Lawn") {
          if (!fullDesc.includes("lawn") && venue.space !== "Outdoor" && venue.space !== "Garden") return false;
        } else if (vType === "Farmhouse") {
          if (venue.type !== "Farmhouse" && !fullDesc.includes("farmhouse")) return false;
        } else if (vType === "Palace") {
          if (venue.type !== "Palace" && !fullDesc.includes("palace")) return false;
        } else if (vType === "Outdoor Venue") {
          if (venue.space !== "Outdoor" && venue.space !== "Garden" && venue.space !== "Poolside" && !fullDesc.includes("lawn")) return false;
        } else if (vType === "Indoor Venue") {
          if (venue.space !== "Indoor" && !fullDesc.includes("hall") && !fullDesc.includes("banquet")) return false;
        }
      }

      // 5. Space filter (Indoor / Outdoor)
      if (filters.space && !filters.space.startsWith("All") && !filters.space.startsWith("Any")) {
        const fullDesc = `${venue.space} ${venue.venueHighlights.join(" ")}`.toLowerCase();
        if (filters.space === "Indoor") {
          if (venue.space !== "Indoor" && !fullDesc.includes("hall") && !fullDesc.includes("indoor")) return false;
        } else if (filters.space === "Outdoor") {
          if (venue.space !== "Outdoor" && venue.space !== "Garden" && venue.space !== "Poolside" && !fullDesc.includes("lawn") && !fullDesc.includes("outdoor")) return false;
        } else if (filters.space === "Indoor & Outdoor") {
          // Matches venues having both or either combination
          if (!fullDesc.includes("lawn") && !fullDesc.includes("banquet") && venue.space !== "Outdoor" && venue.space !== "Indoor") return false;
        }
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
        totalCount={featuredVenues.length}
        activeFilterCount={activeFilterCount}
        onReset={handleResetFilters}
      />

    </div>
  );
}
