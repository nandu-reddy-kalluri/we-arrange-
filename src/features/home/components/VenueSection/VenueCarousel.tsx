"use client";

import React, { useRef } from "react";
import VenueCard from "@/components/cards/VenueCard";
import { Venue } from "@/mock-data/venues";
import { motion } from "framer-motion";
import { useAnalytics } from "@/lib/analytics/hooks";

export function VenueCarousel({ venues }: { venues: Venue[] }) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const { trackVenueClick } = useAnalytics();

  return (
    <div 
      ref={carouselRef}
      className="flex overflow-x-auto gap-6 snap-x snap-mandatory pb-6 md:pb-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible scrollbar-none touch-pan-x" 
      style={{ scrollbarWidth: "none" }}
    >
      {venues.slice(0, 3).map((venue) => (
        <motion.div 
          key={venue.id}
          whileHover={{ y: -5 }}
          onClick={() => trackVenueClick(venue.id)}
          className="w-[85vw] shrink-0 sm:w-[45vw] md:w-auto md:min-w-0 snap-center md:snap-start"
        >
          <VenueCard venue={venue} />
        </motion.div>
      ))}
      <motion.div 
        whileHover={{ y: -5 }}
        className="w-[85vw] shrink-0 sm:w-[45vw] md:w-[320px] snap-center md:snap-start flex flex-col items-center justify-center bg-white rounded-3xl border border-neutral-border shadow-sm cursor-pointer hover:shadow-premium transition-all min-h-[340px] md:min-h-[420px]"
      >
        <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4">
          <span className="text-primary text-2xl font-serif">→</span>
        </div>
        <h3 className="font-serif text-lg font-bold text-neutral-charcoal">View All Venues</h3>
        <p className="text-[13px] text-neutral-muted mt-2 font-medium">Explore 200+ curated locations</p>
      </motion.div>
    </div>
  );
}
