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
      <section className="pt-24 pb-12 md:pt-32 md:pb-16 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className={`${typography.heroTitle} mb-4 text-neutral-900`}>
            Discover Your Dream Venue
          </h1>
          <p className="text-sm md:text-base text-neutral-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Experience a new standard of luxury wedding planning. Find the perfect venue and get the best quotations seamlessly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Option 1: Explore */}
          <div className="bg-white rounded-3xl p-8 border border-[#E8D8BC]/60 shadow-sm flex flex-col items-start hover:shadow-md transition-shadow cursor-pointer">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#C8A165] mb-2">Option 1</span>
            <h3 className="font-serif text-2xl font-bold text-neutral-900 mb-2">Explore Venues</h3>
            <p className="text-sm text-neutral-500 font-medium mb-8">
              Browse our curated collection of luxury spaces and build your wedding shortlist.
            </p>
            <button className="mt-auto flex items-center gap-2 text-sm font-bold text-neutral-900 group">
              Start Exploring
              <svg className="w-4 h-4 text-[#C8A165] group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>

          {/* Option 2: Direct RFQ */}
          <div className="bg-gradient-to-br from-[#1A0810] to-[#2D1622] rounded-3xl p-8 border border-[#3D2632] shadow-sm flex flex-col items-start hover:shadow-md transition-shadow cursor-pointer">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#E8D8BC] mb-2">Option 2</span>
            <h3 className="font-serif text-2xl font-bold text-white mb-2">Get Best Quotations</h3>
            <p className="text-sm text-neutral-300 font-medium mb-8">
              Submit your wedding requirements directly and receive curated quotations from matching venues.
            </p>
            <button className="mt-auto flex items-center gap-2 text-sm font-bold text-[#E8D8BC] group">
              Submit Requirement
              <svg className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
