"use client";

import React from "react";
import { VenueHeroSearch } from "./VenueHeroSearch";
import { QuickExperienceCards } from "./QuickExperienceCards";

import { PremiumVenueGrid } from "./PremiumVenueGrid";
import { typography, spacing } from "@/styles";

export function VenueDiscoveryClient() {
  return (
    <div className="min-h-screen bg-[#FBF7F2] relative pb-32">
      
      {/* 1. Hero Search */}
      <VenueHeroSearch />

      {/* 2. Hero Header & Dual Primary Actions */}
      <section className="pt-6 pb-8 md:pt-32 md:pb-16 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="text-center mb-10 md:mb-16">
          <h1 className="font-serif font-light text-3xl sm:text-4xl md:text-5xl leading-tight tracking-tight mb-4 md:mb-5 max-w-2xl mx-auto text-neutral-900">
            Discover Your <span className="font-semibold text-[#C5A880]">Dream Venue</span>
          </h1>
          <p className="text-sm md:text-base text-neutral-500 font-medium max-w-xl mx-auto leading-relaxed">
            Experience a new standard of luxury wedding planning. Find the perfect venue and get the best quotations seamlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
          {/* Option 1: Explore */}
          <div className="bg-white rounded-[24px] p-6 md:p-10 border border-[#C5A880]/20 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.04)] flex flex-col items-center text-center hover:shadow-[0_8px_40px_-12px_rgba(197,168,128,0.15)] transition-all duration-300 cursor-pointer group">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8B263E] mb-3">Option 1</span>
            <h3 className="font-serif text-2xl md:text-3xl font-medium text-neutral-900 mb-3">Explore Venues</h3>
            <p className="text-[13px] md:text-sm text-neutral-500 font-medium mb-8 leading-relaxed max-w-[280px]">
              Browse our curated collection of luxury spaces and build your wedding shortlist.
            </p>
            <button className="mt-auto flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-800 group-hover:text-[#8B263E] transition-colors">
              Start Exploring
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>

          {/* Option 2: Direct RFQ */}
          <div className="bg-gradient-to-b from-[#FDFBF7] to-[#FAF5F0] rounded-[24px] p-6 md:p-10 border border-[#C5A880]/20 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.04)] flex flex-col items-center text-center hover:shadow-[0_8px_40px_-12px_rgba(197,168,128,0.15)] transition-all duration-300 cursor-pointer group">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8B263E] mb-3">Option 2</span>
            <h3 className="font-serif text-2xl md:text-3xl font-medium text-neutral-900 mb-3">Get Best Quotations</h3>
            <p className="text-[13px] md:text-sm text-neutral-500 font-medium mb-8 leading-relaxed max-w-[280px]">
              Submit your wedding requirements directly and receive curated quotations from matching venues.
            </p>
            <button className="mt-auto flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#C5A880] group-hover:text-[#8B263E] transition-colors">
              Submit Requirement
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* 3. Quick Experience Cards */}
      <section className={`${spacing.section}`}>
        <QuickExperienceCards />
      </section>



      {/* 5. Premium Venue Grid */}
      <PremiumVenueGrid />

      {/* Phase 2+ Structural Mount Points (Hidden/Off-canvas) */}
      <div id="wedding-collection-panel-mount" className="hidden" />
      <div id="budget-planner-mount" className="hidden" />
      <div id="concierge-match-mount" className="hidden" />
      <div id="floating-action-bar-mount" className="hidden" />

    </div>
  );
}
