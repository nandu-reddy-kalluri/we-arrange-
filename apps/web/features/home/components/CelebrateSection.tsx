"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Heart } from "lucide-react";
import { CardStack, type CardStackItem } from "@/components/ui/CardStack";
import type { Venue } from "@/mock-data/venues";
import type { Vendor } from "@/mock-data/vendors";
import { apiClient } from "@we-arrange/api-client";

const dustParticles = [
  { left: 60.7, top: 84.4, duration: 9.2, delay: 1.5 },
  { left: 70.2, top: 55.8, duration: 11.1, delay: 3.2 },
  { left: 64.9, top: 35.5, duration: 8.5, delay: 0.8 },
  { left: 61.8, top: 17.0, duration: 12.3, delay: 2.1 },
  { left: 58.3, top: 10.3, duration: 10.4, delay: 0.4 },
];

const DEFAULT_STACK_ITEMS: CardStackItem[] = [
  {
    id: "falaknuma",
    title: "Taj Falaknuma Palace",
    subtitle: "Engineered Heritage • Hyderabad",
    tag: "Luxury Palace",
    image: "https://venue-images.youmarriagewearrange.com/taj-falaknuma-palace-492086/image-1.webp",
  },
  {
    id: "itc-kohenur",
    title: "ITC Kohenur",
    subtitle: "HITEC City • Contemporary Elegance",
    tag: "5-Star Hotel",
    image: "https://venue-images.youmarriagewearrange.com/itc-kohenur-544059/image-1.webp",
  },
  {
    id: "episode-events",
    title: "Episode Events",
    subtitle: "Bespoke Floral & Mandap Concept",
    tag: "Wedding Decorator",
    image: "https://decorator-images.youmarriagewearrange.com/episode-events-1333773/image-1.webp",
  },
  {
    id: "kunal-khade",
    title: "Kunal Khade Films",
    subtitle: "Cinematic Wedding Documentation",
    tag: "Photographer",
    image: "https://images.youmarriagewearrange.com/kunal-khade-films/image-1.webp",
  },
  {
    id: "sitara-luxury",
    title: "Sitara Luxury Hotel",
    subtitle: "Ramoji Film City • Destination Weddings",
    tag: "Luxury Resort",
    image: "https://venue-images.youmarriagewearrange.com/ramoji-film-city-sitara-luxury-hotel-485923/image-1.webp",
  },
];

interface CelebrateSectionProps {
  venues?: Venue[];
  vendors?: Vendor[];
}

export function CelebrateSection({ venues = [], vendors = [] }: CelebrateSectionProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Combine real database venues and vendors into discovery cards
  const stackItems = useMemo<CardStackItem[]>(() => {
    const items: CardStackItem[] = [];

    if (venues && venues.length > 0) {
      venues.slice(0, 4).forEach((v) => {
        if (v.imageUrl && !v.imageUrl.endsWith(".svg")) {
          items.push({
            id: `venue-${v.id || v.slug}`,
            slug: v.slug,
            title: v.name,
            subtitle: `${v.location || "Hyderabad"}, ${v.city || "Hyderabad"}`,
            tag: v.type ? `${v.type} Venue` : "Curated Venue",
            image: v.imageUrl,
          });
        }
      });
    }

    if (vendors && vendors.length > 0) {
      vendors.slice(0, 4).forEach((vn) => {
        if (vn.imageUrl && !vn.imageUrl.endsWith(".svg")) {
          items.push({
            id: `vendor-${vn.id || vn.slug}`,
            slug: vn.slug,
            title: vn.name,
            subtitle: vn.location || "Hyderabad",
            tag: vn.category ? `${vn.category}` : "Verified Vendor",
            image: vn.imageUrl,
          });
        }
      });
    }

    return items.length >= 3 ? items : DEFAULT_STACK_ITEMS;
  }, [venues, vendors]);

  const handleLike = async (item: CardStackItem) => {
    setToastMessage(`Saved "${item.title || "Item"}" to your shortlist!`);
    setTimeout(() => setToastMessage(null), 3000);

    // Save to favorites API if authenticated
    try {
      const isVenue = item.tag?.toLowerCase().includes("venue");
      const entityType = isVenue ? "venue" : "vendor";
      const rawId = String(item.id || "").replace(/^(venue|vendor)-/, "");
      const numId = parseInt(rawId, 10);
      if (!Number.isNaN(numId)) {
        await apiClient.post("/api/favorites", {
          entityType,
          entityId: numId,
        });
      }
    } catch {
      // Ignored for guest browsing - feedback already shown
    }
  };

  const handleSwipe = (_item: CardStackItem, _directionOrIndex?: any) => {
    // Retain smooth state transition
  };

  return (
    <section 
      id="celebrate-discovery"
      className="relative w-full pt-12 lg:pt-16 overflow-hidden bg-[#FAF7F2]"
    >
      {/* 1. Deep Atmospheric Canvas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Luxury Paper Grain */}
        <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-[0.04] mix-blend-overlay" />
        
        {/* Soft Floral Shadows (Blurred Stencil) */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,black_1px,transparent_6px)] bg-[size:60px_60px] opacity-[0.015] mix-blend-multiply" />
        
        {/* Subtle Moving Champagne Gradient */}
        <motion.div 
          animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-br from-transparent via-[#C89B3C]/5 to-transparent bg-[length:200%_200%]"
        />

        {/* Tiny Golden Particles (Idle Dust) */}
        {dustParticles.map((particle, i) => (
          <motion.div
            key={`ambient-dust-${i}`}
            className="absolute w-1 h-1 bg-gradient-to-tr from-[#C89B3C] to-[#E8C875] rounded-full blur-[1px]"
            style={{ left: `${particle.left}%`, top: `${particle.top}%` }}
            animate={{ y: [0, -100, 0], opacity: [0, 0.3, 0] }}
            transition={{ duration: particle.duration, repeat: Infinity, ease: "easeInOut", delay: particle.delay }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-8 pb-20 lg:pb-28">
        
        {/* LEFT 40%: Copy, CTA, & Active Journey */}
        <div className="w-full lg:w-[40%] flex flex-col items-start justify-center z-20">
          <motion.span 
            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="text-[9px] sm:text-[10px] font-black uppercase text-[#C89B3C] tracking-[0.3em] mb-4"
          >
            YOUR CELEBRATION BEGINS
          </motion.span>
          
          <motion.h2 
            initial={{ opacity: 0, filter: "blur(8px)", y: 15 }}
            whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-[36px] sm:text-[44px] md:text-[52px] tracking-tight leading-[1.05] mb-6 text-neutral-950"
          >
            <span className="font-serif font-bold block">Swipe to Curate,</span>
            <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-[#C89B3C] to-[#E8C875] block mt-1 drop-shadow-[0_2px_10px_rgba(200,155,60,0.2)]">
              Love Every Detail.
            </span>
          </motion.h2>

          <p className="font-sans text-xs sm:text-sm text-neutral-600 mb-8 max-w-md leading-relaxed">
            Discover Hyderabad's finest venues and wedding professionals. Swipe right to shortlist your favorites or click below to start full concierge planning.
          </p>

          {/* Liquid Gold Hover Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4 }}
            onClick={() => {
              const el = document.getElementById("hero");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="group relative px-8 py-4 rounded-full overflow-hidden text-xs font-black uppercase tracking-widest text-white transition-all duration-500 shadow-[0_10px_30px_rgba(18,0,4,0.15)] hover:shadow-[0_15px_40px_rgba(200,155,60,0.4)] flex items-center justify-center gap-3 bg-[#120004]"
          >
            {/* Liquid gold background fill on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#C89B3C] to-[#E8C875] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            
            {/* Intermittent shine pass */}
            <motion.div 
              className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 opacity-80"
              animate={{ x: ["-200%", "300%", "300%", "300%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
            
            <span className="relative z-10 text-white transition-colors duration-300">Start Planning</span>
            <ArrowRight className="w-4 h-4 relative z-10 text-[#C89B3C] group-hover:text-white transition-all duration-300 transform group-hover:translate-x-1" />
          </motion.button>

          {/* Unified Active Timeline */}
          <motion.div 
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.6 }}
            className="relative flex items-center mt-10 overflow-hidden w-full max-w-[300px]"
          >
            {/* Base line */}
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-neutral-200 -translate-y-1/2 -z-10" />
            
            {/* Traveling Gold Light */}
            <motion.div 
              className="absolute top-1/2 left-0 w-[40px] h-[2px] bg-gradient-to-r from-transparent via-[#C89B3C] to-transparent -translate-y-1/2 -z-10 shadow-[0_0_8px_rgba(200,155,60,0.8)] blur-[0.5px]"
              animate={{ x: [-50, 350] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="flex items-center justify-between w-full">
              {[
                { num: "01", text: "Swipe" },
                { num: "02", text: "Shortlist" },
                { num: "03", text: "Celebrate" }
              ].map((step) => (
                <div key={step.text} className="flex items-center gap-1.5 bg-[#FAF7F2] px-2 shadow-[0_0_10px_#FAF7F2]">
                  <span className="text-[8px] font-sans text-[#C89B3C]/80 font-bold">{step.num}</span>
                  <span className="text-[9px] uppercase tracking-widest font-black text-neutral-800">
                    {step.text}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* RIGHT 60%: Interactive Card Stack */}
        <div className="w-full lg:w-[60%] min-h-[500px] relative flex flex-col items-center justify-center mt-6 lg:mt-0 z-10">
          
          {/* Animated SVG Curved Path */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <svg viewBox="0 0 500 500" className="w-full h-full overflow-visible">
              <motion.path 
                d="M 50 100 C 150 -50, 450 100, 350 300 C 250 500, 50 400, 100 250"
                fill="none" stroke="rgba(200,155,60,0.15)" strokeWidth="1" strokeDasharray="5 5"
              />
              <motion.circle 
                cx="0" cy="0" r="3" fill="#E8C875" className="shadow-[0_0_10px_#E8C875]"
                style={{ offsetPath: 'path("M 50 100 C 150 -50, 450 100, 350 300 C 250 500, 50 400, 100 250")' } as any}
                animate={{ offsetDistance: ["0%", "100%"] }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <CardStack
              items={stackItems}
              cardWidth={320}
              cardHeight={420}
              sensitivity={100}
              sendToBackOnClick={true}
              maxVisible={4}
              showActionButtons={true}
              onSwipe={handleSwipe}
              onLike={handleLike}
              className="w-[280px] h-[370px] sm:w-[320px] sm:h-[420px]"
            />
            
            {/* Gesture Hint Pill */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="mt-4 flex items-center gap-2 text-[10px] font-sans font-bold uppercase tracking-[0.25em] text-[#C89B3C]/90 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#E8C875]/40 shadow-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#C89B3C] animate-ping" />
              <span>Swipe left to pass • Swipe right to shortlist</span>
            </motion.div>

            {/* Subtle Shortlist Toast */}
            <AnimatePresence>
              {toastMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="mt-3 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/90 text-white text-xs font-medium shadow-lg backdrop-blur-sm"
                >
                  <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
                  <span>{toastMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CelebrateSection;
