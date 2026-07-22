"use client";

import React from "react";
import { featuredVenues } from "@/mock-data/venues";
import { typography, spacing } from "@/styles";
import VenueCard from "@/components/cards/VenueCard";

export function PremiumVenueGrid() {
  return (
    <section className={`${spacing.section} max-w-7xl mx-auto px-4 sm:px-6`}>
      <div className="mb-8">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#C8A165] mb-2 block">
          Venue Directory
        </span>
        <h2 className={`${typography.sectionTitle} text-neutral-900`}>
          Explore All Venues
        </h2>
      </div>

      {/* Grid: 4 Desktop, 2 Tablet, 1 Mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 lg:gap-x-8 gap-y-10 sm:gap-y-12">
        {featuredVenues.map((venue) => (
          <VenueCard key={venue.id} venue={venue} />
        ))}
      </div>
    </section>
  );
}
