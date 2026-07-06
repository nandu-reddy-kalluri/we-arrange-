"use client";

import React, { useState } from "react";
import { Heart, MapPin, Users, Star } from "lucide-react";
import Image from "next/image";
import { Venue } from "@/mock-data/venues";

export default function VenueCard({ venue }: { venue: Venue }) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="group relative bg-white rounded-[24px] overflow-hidden border border-neutral-border shadow-sm active:scale-[0.98] md:active:scale-100 md:hover:-translate-y-1 md:hover:shadow-[0_12px_40px_rgba(200,161,101,0.15)] transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col h-full cursor-pointer text-left">
      <div className="relative aspect-[16/10] md:aspect-[4/3] w-full overflow-hidden bg-neutral-cream shrink-0">
        <Image
          src={venue.imageUrl}
          alt={venue.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] md:group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-80 z-[1]" />
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            setLiked(!liked);
          }}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-neutral-muted hover:text-[#6F1D2C] active:scale-95 transition-all shadow-sm z-10 focus:outline-none"
        >
          <Heart
            className={`w-4 h-4 transition-transform duration-300 ${
              liked ? "fill-[#6F1D2C] text-[#6F1D2C] scale-110" : "text-neutral-muted"
            }`}
          />
        </button>

        {venue.isPopular && (
          <div className="absolute top-4 left-4 bg-[#6F1D2C] text-[#C8A165] text-[8px] font-black tracking-widest px-2.5 py-1 rounded-md uppercase z-10 shadow-sm">
            Concierge Pick
          </div>
        )}
      </div>

      <div className="p-5 md:p-6 flex flex-col justify-between flex-grow gap-3 relative bg-[#FFFDF9]">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-serif text-[19px] md:text-xl font-bold text-neutral-charcoal leading-snug group-hover:text-[#6F1D2C] transition-colors duration-300">
              {venue.name}
            </h3>
            <div className="flex items-center gap-1 text-[11px] font-bold text-neutral-charcoal shrink-0">
              <Star className="w-3 h-3 text-[#C8A165] fill-[#C8A165]" />
              <span>{venue.rating}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-neutral-500 font-medium">
            <MapPin className="w-3.5 h-3.5 text-[#6F1D2C] shrink-0" />
            <span>{venue.location}</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-semibold text-neutral-muted mt-0.5">
            <Users className="w-3.5 h-3.5 text-[#C8A165] shrink-0" />
            <span>{venue.capacityRange}</span>
          </div>
        </div>

        <div className="pt-3 mt-1 flex items-center justify-between text-xs border-t border-[#E8C97A]/40 mt-auto">
          <div>
            <span className="block text-[8px] uppercase font-black text-neutral-muted tracking-wider">
              Est. Budget
            </span>
            <span className="block text-lg font-semibold text-[#8B6B35] tracking-tight mt-0.5">
              {venue.priceOnwards}
            </span>
          </div>
          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded border border-[#E8C97A]/50 text-[#C8A165] bg-[#FAF7F2] shadow-sm">
            Premium Venue
          </span>
        </div>
      </div>
    </div>
  );
}
