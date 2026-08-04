"use client";

import React from "react";
import { Heart, MapPin, ShieldCheck, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Venue } from "@/mock-data/venues";
import { useVenueStore } from "@/store/useVenueStore";

export default function VenueCard({ venue }: { venue: Venue }) {
  // Try to use the store if available, otherwise fallback to local state? 
  // Actually, let's just use the store since it exists.
  const { weddingShortlist, toggleShortlist } = useVenueStore();
  
  // Safe check since it might render on server
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => setIsMounted(true), []);
  const isSaved = isMounted ? weddingShortlist.includes(venue.id) : false;

  return (
    <Link 
      href={`/venues/${venue.slug}`}
      className="group flex flex-col bg-white border border-gray-100 shadow-[0_8px_32px_0_rgba(25,45,50,0.02)] hover:shadow-[0_20px_40px_rgba(200,161,101,0.15)] hover:-translate-y-1 transition-all duration-300 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#C8A165] rounded-2xl overflow-hidden"
    >
      {/* Image (16:9) */}
      <div className="relative w-full aspect-video bg-gray-100 overflow-hidden">
        <Image
          src={venue.imageUrl}
          alt={venue.name}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
        
        {venue.isVerified && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            <ShieldCheck className="w-3 h-3 text-green-600" />
            <span className="text-[10px] font-bold text-neutral-800">Verified</span>
          </div>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            toggleShortlist(venue.id);
          }}
          className="absolute top-3 right-3 p-1.5 focus:outline-none z-10"
          aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              isSaved ? "fill-[#6F1D2C] text-[#6F1D2C]" : "text-white hover:text-white/80 drop-shadow-md"
            }`}
          />
        </button>
      </div>

      {/* Info Section */}
      <div className="flex flex-col gap-2.5 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-serif text-[17px] font-bold text-neutral-900 leading-snug line-clamp-1 group-hover:text-[#6F1D2C] transition-colors">
            {venue.name}
          </h3>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-[13px] font-medium text-neutral-700">
            <Star className="w-3.5 h-3.5 text-neutral-900 fill-neutral-900 shrink-0" />
            <span className="font-bold">{venue.rating}</span>
            <span className="text-neutral-500 font-normal">({venue.reviewCount} Reviews)</span>
          </div>

          <div className="flex items-center gap-1.5 text-[13px] text-neutral-600 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span>{venue.city} • {venue.type}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1 mt-1">
          <div className="text-[15px] font-bold text-neutral-900">
            {venue.priceOnwards}
          </div>

          <div className="text-[13px] text-neutral-500 line-clamp-1 leading-relaxed">
            {venue.capacityRange}
            {venue.rooms > 0 && ` • ${venue.rooms} Rooms`}
            {venue.venueHighlights.length > 0 && ` • +${venue.venueHighlights.length} More`}
          </div>
        </div>
      </div>
    </Link>
  );
}
