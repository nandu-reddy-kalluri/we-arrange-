"use client";

import React, { useState } from "react";
import { Heart, MapPin, Users, Star, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { Venue } from "@/mock-data/venues";

export default function VenueCard({ venue }: { venue: Venue }) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="group relative bg-white rounded-3xl overflow-hidden border border-neutral-border shadow-sm hover:shadow-premium transition-all duration-500 flex flex-col h-full cursor-pointer text-left">
      <div className="relative aspect-video md:aspect-[4/3] w-full overflow-hidden bg-neutral-cream shrink-0">
        <Image
          src={venue.imageUrl}
          alt={venue.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-80 z-[1]" />
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            setLiked(!liked);
          }}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-neutral-muted hover:text-primary active:scale-95 transition-all shadow-sm z-10 focus:outline-none"
        >
          <Heart
            className={`w-4 h-4 transition-transform duration-300 ${
              liked ? "fill-primary text-primary scale-110" : "text-neutral-muted"
            }`}
          />
        </button>

        {venue.isPopular && (
          <div className="absolute top-4 left-4 bg-primary text-accent-gold text-[8px] font-black tracking-widest px-2.5 py-1 rounded-md uppercase z-10 shadow-sm">
            Concierge Pick
          </div>
        )}
      </div>

      <div className="p-4 md:p-5 flex flex-col justify-between flex-grow gap-2 md:gap-3 relative">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-serif text-[17px] md:text-lg font-bold text-neutral-charcoal leading-snug group-hover:text-primary transition-colors duration-300">
              {venue.name}
            </h3>
            <div className="flex items-center gap-1 text-[11px] font-bold text-neutral-charcoal shrink-0">
              <Star className="w-3 h-3 text-accent-gold fill-accent-gold" />
              <span>{venue.rating}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-semibold text-neutral-muted">
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>{venue.location}</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-semibold text-neutral-muted mt-0.5">
            <Users className="w-3.5 h-3.5 text-accent-gold shrink-0" />
            <span>{venue.capacityRange}</span>
          </div>
        </div>

        <div className="pt-2 md:pt-3 border-t border-neutral-border flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-[8px] uppercase font-black text-neutral-muted tracking-wider">
              Starting Price
            </span>
            <span className="text-[13px] sm:text-[14px] font-black text-primary tracking-tight">
              {venue.priceOnwards}
            </span>
          </div>

          <span className="text-[10px] font-black uppercase tracking-wider text-accent-gold group-hover:text-primary flex items-center gap-0.5 transition-colors duration-200">
            <span>Talk To Specialist</span>
            <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </div>
  );
}
