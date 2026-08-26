"use client";

import React from "react";
import { Venue } from "@/mock-data/venues";
import { typography, spacing } from "@/styles";
import VenueCard from "@/components/cards/VenueCard";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RotateCcw } from "lucide-react";

interface PremiumVenueGridProps {
  venues: Venue[];
  totalCount: number;
  activeFilterCount: number;
  onReset: () => void;
}

export function PremiumVenueGrid({
  venues,
  totalCount,
  activeFilterCount,
  onReset,
}: PremiumVenueGridProps) {
  return (
    <section id="venue-grid" className={`${spacing.section} max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-28`}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-[#E8D8BC]/30 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#C8A165] block">
              Venue Directory
            </span>
            <span className="text-neutral-300">•</span>
            <span className="text-[11px] font-bold text-neutral-500">
              Showing {venues.length} of {totalCount} Luxury Spaces
            </span>
          </div>
          <h2 className={`${typography.sectionTitle} text-neutral-900`}>
            Explore Luxury Venues
          </h2>
        </div>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-[#8B263E] bg-[#FAF5ED] border border-[#C5A880]/30 hover:bg-[#F3ECE0] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset {activeFilterCount} Filter{activeFilterCount > 1 ? "s" : ""}</span>
          </button>
        )}
      </div>

      {venues.length === 0 ? (
        <div className="py-20 px-4 text-center bg-white rounded-3xl border border-[#C5A880]/20 shadow-sm flex flex-col items-center justify-center max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-full bg-[#FAF5ED] border border-[#C5A880]/30 flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-[#C5A880]" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-neutral-900 mb-2">
            No matching venues found
          </h3>
          <p className="text-sm text-neutral-500 mb-6 max-w-md">
            We couldn&apos;t find venues matching your selected filters. Try broadening your location, capacity, or budget criteria.
          </p>
          <button
            type="button"
            onClick={onReset}
            className="px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest text-white bg-[#8B263E] hover:bg-[#6e1c2f] transition-all shadow-md"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        /* Grid: 4 Desktop, 2 Tablet, 1 Mobile */
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 lg:gap-x-8 gap-y-10 sm:gap-y-12"
        >
          <AnimatePresence>
            {venues.map((venue, idx) => (
              <motion.div
                key={venue.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, delay: Math.min(idx * 0.04, 0.3) }}
              >
                <VenueCard venue={venue} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  );
}
