"use client";

import React from "react";
import { Search, MapPin, Grid, Sparkles } from "lucide-react";
import { vendorCategories } from "@/mock-data/vendors";

interface HeroSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  onSearch: () => void;
}

const POPULAR_CHIPS = [
  { label: "Photographers", slug: "photography" },
  { label: "Decorators", slug: "decor" },
  { label: "Makeup Artists", slug: "makeup" },
  { label: "Mehendi Artists", slug: "mehendi" },
  { label: "Caterers", slug: "catering" },
];

export function HeroSection({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedCity,
  setSelectedCity,
  onSearch,
}: HeroSectionProps) {
  
  // Available cities from mock data
  const cities = ["Hyderabad", "Goa", "Jaipur", "Udaipur", "Mumbai", "Delhi", "Kerala"];

  const handleChipClick = (slug: string) => {
    setSelectedCategory(slug);
    onSearch();
  };

  return (
    <section className="relative w-full min-h-[60vh] md:min-h-[70vh] flex items-center justify-center bg-black overflow-hidden pt-28 pb-16">
      {/* Background Image with Parallax Vibe */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/editorial/hero_venue.png"
          alt="Luxury Indian Wedding Background"
          className="w-full h-full object-cover object-center opacity-60 scale-105 transition-transform duration-[10s]"
        />
        {/* Soft Golden & Deep Charcoal Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-neutral-cream/10 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-[#8B263E]/20 to-black/40 z-10" />
      </div>

      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white flex flex-col items-center">
        {/* Decorative Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#C5A880]">
            Curated Elite Partnerships
          </span>
        </div>

        {/* Heading */}
        <h1 className="font-serif font-light text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight tracking-tight mb-4">
          Find Your Perfect <br className="sm:hidden" />
          <span className="font-semibold text-[#C5A880] relative">
            Wedding Vendor
          </span>
        </h1>

        {/* Subheading */}
        <p className="font-sans text-sm sm:text-base md:text-lg max-w-2xl text-white/80 font-light mb-10 leading-relaxed">
          Discover handpicked, verified wedding professionals to make your dream celebrations in Hyderabad and across India absolutely unforgettable.
        </p>

        {/* Premium Search Container */}
        <div className="w-full bg-white/95 backdrop-blur-md rounded-2xl md:rounded-full p-4 md:p-2 shadow-2xl flex flex-col md:flex-row items-center gap-3 border border-[#C5A880]/30 max-w-4xl text-neutral-charcoal">
          {/* Input: Search Vendors */}
          <div className="w-full flex items-center gap-2.5 px-4 py-3 md:py-2 border-b md:border-b-0 md:border-r border-gray-200">
            <Search className="w-5 h-5 text-[#C5A880] shrink-0" />
            <input
              type="text"
              placeholder="Search Vendor Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              className="w-full bg-transparent border-none text-sm focus:outline-none placeholder-gray-400 font-medium text-neutral-900"
            />
          </div>

          {/* Select: Category */}
          <div className="w-full flex items-center gap-2.5 px-4 py-3 md:py-2 border-b md:border-b-0 md:border-r border-gray-200">
            <Grid className="w-5 h-5 text-[#C5A880] shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-transparent border-none text-sm focus:outline-none font-medium text-neutral-900 cursor-pointer appearance-none"
            >
              <option value="" className="text-gray-400">All Categories</option>
              {vendorCategories.map((cat) => (
                <option key={cat.id} value={cat.slug} className="text-neutral-950 font-medium">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Select: City */}
          <div className="w-full flex items-center gap-2.5 px-4 py-3 md:py-2">
            <MapPin className="w-5 h-5 text-[#C5A880] shrink-0" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-transparent border-none text-sm focus:outline-none font-medium text-neutral-900 cursor-pointer appearance-none"
            >
              <option value="" className="text-gray-400">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city} className="text-neutral-950 font-medium">
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <button
            onClick={onSearch}
            className="w-full md:w-auto px-8 py-4 rounded-xl md:rounded-full bg-[#8B263E] hover:bg-[#6e1c2f] text-white font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-md whitespace-nowrap"
          >
            Search
          </button>
        </div>

        {/* Popular Search Chips */}
        <div className="mt-8 flex flex-wrap justify-center items-center gap-2.5 max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-white/60 mr-1.5">
            Popular:
          </span>
          {POPULAR_CHIPS.map((chip) => (
            <button
              key={chip.slug}
              onClick={() => handleChipClick(chip.slug)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 border ${
                selectedCategory === chip.slug
                  ? "bg-[#C5A880] text-black border-[#C5A880]"
                  : "bg-white/10 text-white/95 border-white/20 hover:bg-white/20 hover:border-white/40"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
