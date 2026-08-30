"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, MapPin, Camera, Sparkles, Scissors, Utensils, Brush, Search, Check } from "lucide-react";
import VenueCard from "@/components/cards/VenueCard";
import { featuredVenues } from "@/mock-data/venues";
import VendorCard from "@/components/cards/VendorCard";
import { mockVendors } from "@/mock-data/vendors";

const featuredVendors = mockVendors.filter(v => v.isFeatured);

export function MobileHomeExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Subtle hero parallax
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 20]);

  const categories = [
    { id: "venues", label: "Venues", icon: MapPin, href: "/venues" },
    { id: "photography", label: "Photography", icon: Camera, href: "/vendors/photography" },
    { id: "makeup", label: "Makeup", icon: Brush, href: "/vendors/makeup" },
    { id: "decor", label: "Decor", icon: Sparkles, href: "/vendors/decor" },
    { id: "mehendi", label: "Mehendi", icon: Scissors, href: "/vendors/mehendi" },
    { id: "catering", label: "Catering", icon: Utensils, href: "/vendors/catering" },
  ];

  return (
    <div ref={containerRef} className="flex flex-col bg-[#FBF9F6] min-h-screen pb-6 overflow-x-hidden">
      
      {/* 1. HERO SECTION (Cinematic Parallax) */}
      <motion.section 
        className="px-4 pt-4 pb-6 flex flex-col items-center text-center relative z-10"
        style={{ opacity: heroOpacity, y: heroY }}
      >
        <motion.div 
          className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 shadow-md border border-neutral-100"
          style={{ scale: heroScale }}
        >
          <Image
            src="/images/editorial/hero_venue.png"
            alt="Beautiful Indian wedding venue in Hyderabad"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
        
        <h1 className="font-serif text-[28px] font-bold text-neutral-900 leading-tight mb-3 px-2">
          Find the right places<br />and people for your wedding.
        </h1>
        <p className="font-sans text-[13px] text-neutral-600 mb-8 max-w-[280px] leading-relaxed">
          Discover venues and trusted wedding professionals in Hyderabad.
        </p>

        <Link 
          href="#concierge-journey"
          className="w-full py-4 rounded-full text-[11px] font-bold uppercase tracking-widest text-white bg-[#8B263E] shadow-[0_8px_20px_rgba(139,38,62,0.25)] active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
        >
          Start Planning <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.section>

      {/* Subtle visual connector instead of a massive empty gap */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-[#C5A880]/30 to-transparent my-4" />

      {/* 2. CATEGORIES GRID */}
      <section className="px-4 py-6 relative z-20 bg-[#FBF9F6]">
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C5A880] text-center mb-5"
        >
          What are you looking for?
        </motion.h2>
        
        <div className="grid grid-cols-2 gap-3">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <Link href={cat.href} key={cat.id}>
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{ delay: idx * 0.05, duration: 0.4 }}
                  whileTap={{ scale: 0.96 }}
                  className="flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-[#C5A880]/20 shadow-[0_2px_10px_rgba(0,0,0,0.02)] gap-2 touch-manipulation"
                >
                  <Icon className="w-5 h-5 text-[#8B263E]" strokeWidth={1.5} />
                  <span className="font-sans text-[11px] font-bold text-neutral-800 tracking-wide">{cat.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. QUICK SEARCH */}
      <section className="px-4 pb-8 pt-2">
        <Link href="#concierge-journey">
          <motion.div 
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-between w-full px-5 py-3.5 rounded-full bg-white border border-[#E8D8BC] text-neutral-500 shadow-sm"
          >
            <span className="text-[13px] font-medium">Search venues, vendors...</span>
            <Search className="w-4 h-4 text-[#C5A880]" />
          </motion.div>
        </Link>
      </section>

      {/* 4. HORIZONTAL FEATURED VENUES */}
      <section className="py-8 bg-white border-y border-neutral-100">
        <div className="px-4 flex flex-col mb-5">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C5A880] mb-1">
            Popular in Hyderabad
          </h2>
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-2xl font-bold text-neutral-900">Featured Venues</h3>
            <Link href="/venues" className="text-[10px] font-bold uppercase tracking-wider text-[#8B263E] flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Horizontal Snap Scroll */}
        <div className="w-full overflow-x-auto snap-x snap-mandatory hide-scrollbar pl-4 pb-6 flex gap-4 pr-12">
          {featuredVenues.slice(0, 4).map((venue) => (
            <div key={venue.id} className="snap-center shrink-0 w-[85vw] max-w-[320px]">
              <VenueCard venue={venue} />
            </div>
          ))}
        </div>
      </section>

      {/* 5. HORIZONTAL POPULAR VENDORS */}
      <section className="py-8 bg-[#FBF9F6]">
        <div className="px-4 flex flex-col mb-5">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C5A880] mb-1">
            Top Professionals
          </h2>
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-2xl font-bold text-neutral-900">Popular Vendors</h3>
            <Link href="/vendors" className="text-[10px] font-bold uppercase tracking-wider text-[#8B263E] flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Horizontal Snap Scroll */}
        <div className="w-full overflow-x-auto snap-x snap-mandatory hide-scrollbar pl-4 pb-6 flex gap-4 pr-12">
          {featuredVendors.slice(0, 4).map((vendor) => (
            <div key={vendor.id} className="snap-center shrink-0 w-[85vw] max-w-[320px]">
              <VendorCard vendor={vendor} />
            </div>
          ))}
        </div>
      </section>

      {/* 6. TRUST SECTION */}
      <section className="px-5 py-10 bg-[#FAF5ED] border-y border-[#C5A880]/20 flex flex-col items-center">
        <h2 className="font-serif text-xl font-bold text-neutral-900 mb-6 text-center">
          Why YouMarriage?
        </h2>
        <div className="flex flex-col gap-4 w-full max-w-[240px]">
          <div className="flex items-center gap-3 text-neutral-800">
            <div className="w-5 h-5 rounded-full bg-[#8B263E] flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 text-white" strokeWidth={3} />
            </div>
            <span className="text-[13px] font-bold">Verified venues & vendors</span>
          </div>
          <div className="flex items-center gap-3 text-neutral-800">
            <div className="w-5 h-5 rounded-full bg-[#8B263E] flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 text-white" strokeWidth={3} />
            </div>
            <span className="text-[13px] font-bold">Transparent quotes</span>
          </div>
          <div className="flex items-center gap-3 text-neutral-800">
            <div className="w-5 h-5 rounded-full bg-[#8B263E] flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 text-white" strokeWidth={3} />
            </div>
            <span className="text-[13px] font-bold">Dedicated wedding concierge</span>
          </div>
        </div>
      </section>

      {/* 7. LOCAL / SEO CONTENT (Natural placement) */}
      <section className="px-5 py-10 bg-white border-b border-neutral-100">
        <h2 className="font-serif text-lg font-bold text-neutral-900 mb-3">
          Weddings in Hyderabad
        </h2>
        <p className="font-sans text-[13px] text-neutral-600 leading-relaxed">
          From the regal palaces of Taj Falaknuma to the sprawling luxury resorts in Gachibowli and Moinabad, explore Hyderabad's finest wedding venues and elite wedding professionals. Whether you are planning an intimate gathering in Jubilee Hills or a grand celebration, YouMarriage ensures a seamless booking experience.
        </p>
      </section>

    </div>
  );
}
