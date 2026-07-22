import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { featuredVenues } from "@/mock-data/venues";
import { VenueCarousel } from "./VenueCarousel";
import { typography, spacing, colors, layout } from "@/styles";

export default function VenueSection() {
  return (
    <section className={`py-10 lg:py-14 ${colors.bgPrimary} relative`}>
      <div className={`${layout.maxWidth} ${spacing.container}`}>
        <div className={`flex flex-col sm:flex-row items-center sm:items-end justify-between mb-6 pb-4 border-b ${colors.border} gap-3`}>
          <div className="text-center sm:text-left">
            <span className="font-sans text-[10px] font-black uppercase text-accent-gold tracking-[0.25em] block mb-2">
              CHOOSE • Curated Recommendations
            </span>
            <h2 className={typography.sectionTitle}>
              Featured Hyderabad Venues
            </h2>
          </div>
          <Link
            href="/venues"
            className={`flex items-center gap-1 ${typography.label} text-primary hover:text-primary-dark transition-colors group shrink-0 min-h-[48px]`}
          >
            <span>View Curated Collection</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <VenueCarousel venues={featuredVenues} />
      </div>
    </section>
  );
}
