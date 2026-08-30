"use client";

import React from "react";
import { Heart, MapPin, ShieldCheck, Star, ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Venue } from "@/mock-data/venues";
import { useVenueStore } from "@/store/useVenueStore";

export default function VenueCard({ venue }: { venue: Venue }) {
  const { weddingShortlist, toggleShortlist } = useVenueStore();
  
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => setIsMounted(true), []);
  const isSaved = isMounted ? weddingShortlist.includes(venue.id) : false;

  const images = React.useMemo(() => {
    const list = Array.from(new Set([venue.imageUrl, ...(venue.gallery || [])].filter(Boolean)));
    if (list.length <= 1) {
      return [venue.imageUrl, "/images/editorial/insp_bridal.png", "/images/editorial/vendor_decoration.png"];
    }
    return list;
  }, [venue]);

  const [currentImgIndex, setCurrentImgIndex] = React.useState(0);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const touchStartRef = React.useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 35) {
      if (deltaX < 0) {
        setCurrentImgIndex((prev) => (prev + 1) % images.length);
      } else {
        setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
      }
    }
  };

  return (
    <>
      <div className="group flex flex-col bg-white border border-gray-100 shadow-[0_8px_32px_0_rgba(25,45,50,0.02)] hover:shadow-[0_20px_40px_rgba(200,161,101,0.15)] hover:-translate-y-1 transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-[#C8A165] rounded-2xl overflow-hidden">
        {/* Image Container with Touch Swipe on Mobile */}
        <div 
          className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden select-none cursor-pointer"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={() => {
            if (!touchStartRef.current) {
              setIsModalOpen(true);
            }
          }}
        >
          <Image
            src={images[currentImgIndex] || venue.imageUrl}
            alt={venue.name}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300 pointer-events-none" />
          
          {venue.isVerified && (
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm z-10">
              <ShieldCheck className="w-3 h-3 text-green-600" />
              <span className="text-[10px] font-bold text-neutral-800">Verified</span>
            </div>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
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

          {/* Mobile Subtle Image Indicator */}
          {images.length > 1 && (
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm z-10">
              {images.length <= 5 ? (
                images.map((_, idx) => (
                  <span
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      idx === currentImgIndex ? "bg-white scale-125" : "bg-white/50"
                    }`}
                  />
                ))
              ) : (
                <span className="text-[9px] font-black text-white uppercase tracking-widest">
                  {currentImgIndex + 1} / {images.length}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="flex flex-col gap-1.5 md:gap-2.5 p-3 md:p-5">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/venues/${venue.slug}`} className="font-serif text-base md:text-[17px] font-bold text-neutral-900 leading-snug line-clamp-1 group-hover:text-[#6F1D2C] transition-colors">
              {venue.name}
            </Link>
          </div>

          <div className="flex flex-col gap-1 md:gap-1.5">
            <div className="flex items-center gap-1.5 text-xs md:text-[13px] font-medium text-neutral-700">
              <Star className="w-3.5 h-3.5 text-neutral-900 fill-neutral-900 shrink-0" />
              <span className="font-bold">{venue.rating}</span>
              <span className="text-neutral-500 font-normal">({venue.reviewCount})</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs md:text-[13px] text-neutral-600 line-clamp-1">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>{venue.city} • {venue.type}</span>
            </div>
          </div>

          <div className="flex flex-col gap-0.5 md:gap-1 mt-0.5 md:mt-1">
            <div className="text-sm md:text-[15px] font-bold text-neutral-900">
              {venue.priceOnwards}
            </div>

            <div className="text-xs md:text-[13px] text-neutral-500 line-clamp-1 leading-relaxed">
              {venue.capacityRange}
              {venue.rooms > 0 && ` • ${venue.rooms} Rooms`}
              <span className="hidden sm:inline">
                {venue.venueHighlights.length > 0 && ` • +${venue.venueHighlights.length} More`}
              </span>
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden pt-3 mt-1 border-t border-gray-100 flex items-center justify-between gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                window.location.href = "tel:+919876543210";
              }}
              className="flex-1 py-2.5 rounded-lg text-[10px] font-bold text-center bg-neutral-100 text-neutral-800 hover:bg-neutral-200 transition-colors whitespace-nowrap"
            >
              Call
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                alert(`Quote requested for ${venue.name}`);
              }}
              className="flex-1 py-2.5 rounded-lg text-[10px] font-bold text-center bg-[#8B263E]/10 text-[#8B263E] hover:bg-[#8B263E] hover:text-white transition-colors whitespace-nowrap"
            >
              Get Quote
            </button>
            <Link
              href={`/venues/${venue.slug}`}
              className="flex-1 py-2.5 rounded-lg text-[10px] font-bold text-center bg-[#8B263E] text-white hover:bg-[#6e1c2f] transition-colors flex items-center justify-center whitespace-nowrap"
            >
              View
            </Link>
          </div>
        </div>
      </div>

      {/* Full-Screen Mobile Image Modal Viewer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-md flex flex-col justify-between p-4">
          {/* Header */}
          <div className="flex items-center justify-between text-white pt-2">
            <span className="text-xs font-bold truncate max-w-[70%]">{venue.name}</span>
            <span className="text-xs font-mono font-bold bg-white/10 px-3 py-1 rounded-full">
              {currentImgIndex + 1} / {images.length}
            </span>
            <button
              onClick={() => setIsModalOpen(false)}
              className="p-2 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Main Image Stage */}
          <div 
            className="relative flex-1 my-auto w-full flex items-center justify-center select-none"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <Image
              src={images[currentImgIndex] || venue.imageUrl}
              alt={venue.name}
              fill
              unoptimized
              className="object-contain"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between text-white pb-6 px-4">
            <button
              onClick={() => setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length)}
              className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <span className="text-xs font-bold text-white/70">Swipe or tap arrows</span>
            <button
              onClick={() => setCurrentImgIndex((prev) => (prev + 1) % images.length)}
              className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
