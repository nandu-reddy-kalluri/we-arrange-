"use client";

import React from "react";
import Image from "next/image";
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
    <section className="relative w-full min-h-0 md:min-h-[60vh] flex items-center justify-center bg-black overflow-hidden pt-28 pb-16 md:pt-32 md:pb-20">
      {/* Background Image with Parallax Vibe */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/editorial/hero_venue.png"
          alt="Luxury Indian Wedding Background"
          fill
          priority
          quality={90}
          sizes="100vw"
          className="object-cover object-center opacity-80 scale-105 transition-transform duration-[10s]"
        />
        {/* Cinematic & luxurious overlay (neutral, not muddy) */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-neutral-cream/10 z-10" />
        {/* Bottom protection gradient for chips */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/40 to-transparent z-10" />
      </div>

      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white flex flex-col items-center">
        {/* Decorative Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-4 md:mb-6 animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#FAF9F6]">
            Curated Elite Partnerships
          </span>
        </div>

        {/* Heading */}
        <h1 className="font-serif font-light text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight tracking-tight mb-4 md:mb-5 max-w-[85%] md:max-w-[70%] lg:max-w-2xl mx-auto">
          Find Your Perfect <span className="font-semibold text-[#E6D5B8]">Wedding Vendor</span>
        </h1>

        {/* Subheading */}
        <p className="font-sans text-xs sm:text-sm md:text-base max-w-xl text-white/90 font-light mb-8 md:mb-10 leading-relaxed mx-auto drop-shadow-sm">
          Discover handpicked, verified wedding professionals to make your dream celebrations in Hyderabad and across India absolutely unforgettable.
        </p>

        {/* Premium Search Container */}
        <div className="w-full bg-white/95 backdrop-blur-md rounded-2xl md:rounded-full p-1.5 md:p-1.5 shadow-2xl flex flex-col md:flex-row items-center gap-1.5 border border-[#C5A880]/15 max-w-3xl text-neutral-charcoal">
          {/* Input: Search Vendors */}
          <div className="w-full flex items-center gap-2 px-4 py-2 border-b md:border-b-0 md:border-r border-gray-200/50">
            <Search className="w-4 h-4 md:w-5 md:h-5 text-[#C5A880] shrink-0" />
            <input
              type="text"
              placeholder="Search Vendor Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              className="w-full bg-transparent border-none text-sm md:text-[15px] focus:outline-none placeholder-gray-400 font-medium text-neutral-900"
            />
          </div>

          {/* Select: Category */}
          <div className="w-full flex items-center gap-2 px-4 py-2 border-b md:border-b-0 md:border-r border-gray-200/50">
            <Grid className="w-4 h-4 md:w-5 md:h-5 text-[#C5A880] shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-transparent border-none text-sm md:text-[15px] focus:outline-none font-medium text-neutral-900 cursor-pointer appearance-none"
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
          <div className="w-full flex items-center gap-2 px-4 py-2">
            <MapPin className="w-4 h-4 md:w-5 md:h-5 text-[#C5A880] shrink-0" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-transparent border-none text-sm md:text-[15px] focus:outline-none font-medium text-neutral-900 cursor-pointer appearance-none"
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
            className="w-full md:w-auto px-8 py-3 md:py-3.5 rounded-xl md:rounded-full bg-[#8B263E] hover:bg-[#6e1c2f] text-white font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-md whitespace-nowrap"
          >
            Search
          </button>
        </div>

        {/* Popular Search Chips */}
        <div className="mt-6 md:mt-8 flex flex-wrap justify-center items-center gap-2 md:gap-2.5 max-w-3xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/60 mr-1">
            Popular:
          </span>
          {POPULAR_CHIPS.map((chip) => (
            <button
              key={chip.slug}
              onClick={() => handleChipClick(chip.slug)}
              className={`px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-medium tracking-wide transition-all duration-300 border backdrop-blur-sm shadow-sm ${
                selectedCategory === chip.slug
                  ? "bg-white/90 text-black border-transparent"
                  : "bg-black/10 text-white/80 border-white/10 hover:bg-black/20 hover:text-white"
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
