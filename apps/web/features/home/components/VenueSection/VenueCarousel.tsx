"use client";

import React, { useRef } from "react";
import Link from "next/link";
import VenueCard from "@/components/cards/VenueCard";
import { Venue } from "@/mock-data/venues";
import { motion } from "framer-motion";
import { useAnalytics } from "@/lib/analytics/hooks";
import Image from "next/image";
import { Star, ChevronRight } from "lucide-react";

export function VenueCarousel({ venues }: { venues: Venue[] }) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const { trackVenueClick } = useAnalytics();

  return (
    <motion.div 
      ref={carouselRef}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.1 } }
      }}
      className="flex overflow-x-auto gap-6 snap-x snap-mandatory pb-6 md:pb-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible scrollbar-none touch-pan-x" 
      style={{ scrollbarWidth: "none" }}
    >
      {venues.slice(0, 3).map((venue) => (
        <motion.div 
          key={venue.id}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
          }}
          whileHover={{ y: -5 }}
          onClick={() => trackVenueClick(venue.id)}
          className="w-[85vw] shrink-0 sm:w-[45vw] md:w-auto md:min-w-0 snap-center md:snap-start"
        >
          <VenueCard venue={venue} />
        </motion.div>
      ))}
      <motion.div 
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
        }}
        whileHover={{ y: -5 }}
        className="w-[85vw] shrink-0 sm:w-[45vw] md:w-full snap-center md:snap-start h-full"
      >
        <Link
          href="/venues"
          className="group relative w-full flex flex-col items-center justify-center rounded-[20px] border border-[#E8C97A]/40 shadow-sm cursor-pointer hover:shadow-[0_20px_40px_rgba(200,161,101,0.15)] transition-all duration-500 h-full min-h-[280px] py-10 overflow-hidden block"
        >
          {/* Luxury Background System */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#FDFBF7] to-[#F3EAE0] z-0" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(200,155,60,0.04)_1px,transparent_1px)] bg-[size:12px_12px] opacity-60 mix-blend-multiply z-0" />
          
          {/* Shimmering Golden Accents */}
          <motion.div 
            animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.1, 1] }} 
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} 
            className="absolute -top-16 -right-16 w-48 h-48 bg-[#C8A165]/20 blur-[50px] rounded-full z-0 pointer-events-none" 
          />
          <motion.div 
            animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.2, 1] }} 
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }} 
            className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#E8C97A]/30 blur-[40px] rounded-full z-0 pointer-events-none" 
          />

          {/* Stacked Avatars / Preview Thumbnails */}
          <div className="relative z-10 flex items-center justify-center mb-5 h-10 drop-shadow-sm group-hover:-translate-y-1 transition-transform duration-500">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-sm relative -ml-3 first:ml-0"
                style={{ zIndex: 10 - i }}
              >
                <Image src={`/images/editorial/venue_${i}.png`} alt="Venue Preview" fill unoptimized className="object-cover" />
              </div>
            ))}
            <div className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-[#8B263E] to-[#6e1c2f] text-white flex items-center justify-center text-[10px] font-black tracking-tighter shadow-sm relative -ml-3 z-0">
              200+
            </div>
          </div>
          
          {/* Typography Hierarchy */}
          <div className="relative z-10 flex flex-col items-center text-center px-6">
            <span className="text-[8px] md:text-[9px] uppercase tracking-[0.25em] font-black text-[#8B263E] mb-2 flex items-center gap-1.5">
              <Star className="w-2.5 h-2.5 fill-[#8B263E]" />
              Curated Collection
            </span>
            
            <h3 className="font-serif text-[20px] md:text-[22px] font-bold text-neutral-900 leading-tight mb-2 group-hover:text-[#8B263E] transition-colors duration-300">
              Luxury Wedding Spaces
            </h3>
            
            <p className="text-[11px] font-semibold text-neutral-500 mb-6 group-hover:text-neutral-700 transition-colors duration-300">
              Explore Hyderabad's finest venues
            </p>

            {/* Glowing Premium Arrow Button */}
            <div className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm border border-white/40 shadow-[0_4px_15px_rgba(139,38,62,0.15)] flex items-center justify-center group-hover:bg-[#8B263E] group-hover:shadow-[0_8px_25px_rgba(139,38,62,0.35)] group-hover:border-[#8B263E] transition-all duration-500 group-hover:scale-110">
              <ChevronRight className="w-5 h-5 text-[#8B263E] group-hover:text-white transition-colors duration-500 group-hover:translate-x-0.5" />
            </div>
          </div>
        </Link>
      </motion.div>
    </motion.div>
  );
}
