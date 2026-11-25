"use client";

import React from "react";
import { Heart, MapPin, ShieldCheck, Star, ChevronLeft, ChevronRight, X, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Venue } from "@/mock-data/venues";
import { useSavedStore } from "@/store/useSavedStore";
import { DEFAULT_VENUE_IMAGE } from "@/services/catalog/catalogMappers";

export default function VenueCard({
  venue,
  onRemove,
  priority = false,
}: {
  venue: Venue;
  onRemove?: () => void;
  priority?: boolean;
}) {
  const router = useRouter();
  const { isVenueSaved, toggleSaveVenue } = useSavedStore();
  
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => setIsMounted(true), []);
  const isSaved = isMounted ? isVenueSaved(venue.id) : false;

  const images = React.useMemo(() => {
    const list = Array.from(new Set([venue.imageUrl, ...(venue.gallery || [])].filter(Boolean)));
    return list.length > 0 ? list : [DEFAULT_VENUE_IMAGE];
  }, [venue]);

  const [currentImgIndex, setCurrentImgIndex] = React.useState(0);
  const [viewedIndices, setViewedIndices] = React.useState<number[]>([0]);
  const [brokenUrls, setBrokenUrls] = React.useState<Record<string, boolean>>({});
  const [loadedMap, setLoadedMap] = React.useState<Record<string, boolean>>({});
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const touchStartRef = React.useRef<{ x: number; y: number } | null>(null);
  const isSwipingRef = React.useRef(false);

  React.useEffect(() => {
    setViewedIndices((prev) => (prev.includes(currentImgIndex) ? prev : [...prev, currentImgIndex]));
  }, [currentImgIndex]);

  const handleTouchStart = (e: React.TouchEvent) => {
    isSwipingRef.current = false;
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

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 20) {
      isSwipingRef.current = true;
      if (deltaX < 0) {
        setCurrentImgIndex((prev) => (prev + 1) % images.length);
      } else {
        setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
      }
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (isSwipingRef.current) {
      isSwipingRef.current = false;
      return;
    }
    router.push(`/venues/${venue.slug}`);
  };

  const handleCardMouseEnter = () => {
    if (typeof window !== "undefined" && images.length > 1 && images[1] && !loadedMap[images[1]]) {
      const nextImg = new window.Image();
      nextImg.src = images[1];
    }
  };

  return (
    <>
      <div 
        onClick={handleCardClick}
        onMouseEnter={handleCardMouseEnter}
        className="gpu-accelerate group flex flex-col bg-white border border-gray-100 shadow-[0_8px_32px_0_rgba(25,45,50,0.02)] hover:shadow-[0_20px_40px_rgba(200,161,101,0.15)] hover:-translate-y-1 transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-[#C8A165] rounded-2xl overflow-hidden cursor-pointer"
      >
        {/* Image Container with Automatic 1s Slider and Touch Swipe */}
        <div 
          className="relative w-full aspect-[4/3] bg-gradient-to-r from-stone-100 via-stone-50 to-stone-100 overflow-hidden select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Fluent shimmer skeleton while image is loading */}
          {!loadedMap[images[currentImgIndex]] && (
            <div className="absolute inset-0 bg-gradient-to-r from-stone-100 via-[#F7F4EE] to-stone-100 animate-pulse z-0 pointer-events-none" />
          )}
          {images.map((imgUrl, idx) => {
            if (!viewedIndices.includes(idx)) return null;
            const resolvedSrc = brokenUrls[imgUrl] ? DEFAULT_VENUE_IMAGE : imgUrl;
            const isCurrent = idx === currentImgIndex;
            const isLoaded = loadedMap[imgUrl];
            return (
              <Image
                key={imgUrl + idx}
                src={resolvedSrc}
                alt={venue.name}
                fill
                priority={Boolean(priority && idx === 0)}
                unoptimized={resolvedSrc.endsWith(".svg")}
                quality={75}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 340px"
                onLoad={() => setLoadedMap((prev) => ({ ...prev, [imgUrl]: true }))}
                onError={() => setBrokenUrls((prev) => ({ ...prev, [imgUrl]: true }))}
                className={`object-cover transition-all duration-700 ease-out group-hover:scale-105 ${
                  isCurrent
                    ? isLoaded
                      ? "opacity-100 blur-0 scale-100 z-0"
                      : "opacity-0 blur-[4px] scale-[1.02] z-0"
                    : "opacity-0 pointer-events-none"
                }`}
              />
            );
          })}
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
              if (onRemove && isSaved) {
                onRemove();
              } else {
                toggleSaveVenue(venue.id);
              }
            }}
            className="absolute top-3 right-3 p-1.5 focus:outline-none z-10"
            aria-label={isSaved ? "Remove from saved" : "Save venue"}
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isSaved ? "fill-[#8B263E] text-[#8B263E]" : "text-white hover:text-white/80 drop-shadow-md"
              }`}
            />
          </button>

          {/* Image Indicator Dots */}
          {images.length > 1 && (
            <div 
              className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {images.length <= 5 ? (
                images.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImgIndex(idx);
                    }}
                    className="w-6 h-6 flex items-center justify-center p-0 focus:outline-none"
                    aria-label={`Go to slide ${idx + 1}`}
                  >
                    <span
                      className={`block w-1.5 h-1.5 rounded-full transition-all ${
                        idx === currentImgIndex ? "bg-white scale-125" : "bg-white/50"
                      }`}
                    />
                  </button>
                ))
              ) : (
                <span className="text-[9px] font-black text-white uppercase tracking-widest px-1">
                  {currentImgIndex + 1} / {images.length}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="flex flex-col gap-1.5 md:gap-2.5 p-3 md:p-5">
          <div className="flex items-start justify-between gap-2">
            <Link 
              href={`/venues/${venue.slug}`} 
              onClick={(e) => e.stopPropagation()}
              className="font-serif text-base md:text-[17px] font-bold text-neutral-900 leading-snug line-clamp-1 group-hover:text-[#6F1D2C] transition-colors"
            >
              {venue.name}
            </Link>
          </div>

          <div className="flex flex-col gap-1 md:gap-1.5">
            {venue.rating > 0 && (
              <div className="flex items-center gap-1.5 text-xs md:text-[13px] font-medium text-neutral-700">
                <Star className="w-3.5 h-3.5 text-neutral-900 fill-neutral-900 shrink-0" />
                <span className="font-bold">{venue.rating.toFixed(1)}</span>
                {venue.reviewCount > 0 && (
                  <span className="text-neutral-500 font-normal">({venue.reviewCount})</span>
                )}
              </div>
            )}

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
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                router.push(`/venues/${venue.slug}`);
              }}
              className="flex-1 py-2.5 rounded-lg text-[10px] font-bold text-center bg-neutral-100 text-neutral-800 hover:bg-neutral-200 transition-colors whitespace-nowrap"
            >
              Details
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                router.push(`/venues/${venue.slug}#contact`);
              }}
              className="flex-1 py-2.5 rounded-lg text-[10px] font-bold text-center bg-[#8B263E]/10 text-[#8B263E] hover:bg-[#8B263E] hover:text-white transition-colors whitespace-nowrap"
            >
              Get Quote
            </button>
          </div>

          {onRemove && (
            <div className="pt-2.5 mt-1 border-t border-gray-100">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onRemove();
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-[#8B263E] bg-[#8B263E]/8 hover:bg-[#8B263E] hover:text-white border border-[#8B263E]/20 transition-all duration-200"
                title="Remove from saved"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          )}
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
              src={
                brokenUrls[images[currentImgIndex] || ""]
                  ? DEFAULT_VENUE_IMAGE
                  : images[currentImgIndex] || venue.imageUrl || DEFAULT_VENUE_IMAGE
              }
              alt={venue.name}
              fill
              sizes="(max-width: 1024px) 100vw, 90vw"
              quality={85}
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

