"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Star, MapPin, ChevronLeft, ChevronRight, X, Heart, Trash2 } from "lucide-react";
import { Vendor } from "@/mock-data/vendors";
import { useSavedStore } from "@/store/useSavedStore";
import { getVendorFallbackImage } from "@/services/catalog/catalogMappers";

export default function VendorCard({ vendor, onRemove }: { vendor: Vendor; onRemove?: () => void }) {
  const router = useRouter();
  const { isVendorSaved, toggleSaveVendor } = useSavedStore();
  const fallbackImage = getVendorFallbackImage(vendor.category);

  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => setIsMounted(true), []);
  const isSaved = isMounted ? isVendorSaved(vendor.id) : false;

  const images = React.useMemo(() => {
    const list = Array.from(
      new Set([vendor.imageUrl, vendor.logoUrl].filter(Boolean))
    ) as string[];
    return list.length > 0 ? list : [fallbackImage];
  }, [vendor, fallbackImage]);

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

  const handleCardClick = () => {
    if (isSwipingRef.current) {
      isSwipingRef.current = false;
      return;
    }
    router.push(`/vendors/${vendor.slug}`);
  };

  return (
    <>
      <div 
        onClick={handleCardClick}
        className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-[0_8px_32px_0_rgba(25,45,50,0.02)] hover:shadow-premium hover:-translate-y-1 transition-all duration-300 cursor-pointer"
      >
        {/* Image Container with Touch Swipe on Mobile */}
        <div
          className="relative w-full aspect-[4/3] overflow-hidden bg-gradient-to-r from-stone-100 via-stone-50 to-stone-100 select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Fluent shimmer skeleton while active image is decoding */}
          {!loadedMap[images[currentImgIndex]] && (
            <div className="absolute inset-0 bg-gradient-to-r from-stone-100 via-[#F7F4EE] to-stone-100 animate-pulse z-0 pointer-events-none" />
          )}
          {images.map((imgUrl, idx) => {
            if (!viewedIndices.includes(idx)) return null;
            const resolvedSrc = brokenUrls[imgUrl] ? fallbackImage : imgUrl;
            const isCurrent = idx === currentImgIndex;
            const isLoaded = loadedMap[imgUrl];
            return (
              <Image
                key={imgUrl + idx}
                src={resolvedSrc}
                alt={vendor.name}
                fill
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

          <div className="absolute top-3 left-3 md:top-4 md:left-4 bg-white/90 backdrop-blur-md px-2.5 py-1 md:px-3.5 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-bold text-[hsl(340,60%,15%)] uppercase tracking-wider shadow-sm z-10">
            {vendor.category}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (onRemove && isSaved) {
                onRemove();
              } else {
                toggleSaveVendor(vendor.id);
              }
            }}
            className="absolute top-3 right-3 md:top-4 md:right-4 p-1.5 focus:outline-none z-10"
            aria-label={isSaved ? "Remove from saved" : "Save vendor"}
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isSaved ? "fill-[#8B263E] text-[#8B263E]" : "text-white hover:text-white/80 drop-shadow-md"
              }`}
            />
          </button>

          {/* Mobile Subtle Image Indicator */}
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

        {/* Details */}
        <div className="p-3.5 md:p-6">
          <div className="flex items-center justify-between mb-1.5 md:mb-2">
            <h3 className="font-serif text-sm md:text-base font-bold text-[#2D2D2D] truncate group-hover:text-[#C5A880] transition-colors duration-200">
              {vendor.name}
            </h3>
            {vendor.rating > 0 && (
              <div className="flex items-center gap-1 text-xs font-bold text-[#2D2D2D]">
                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                <span>{vendor.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-[hsl(240,5%,45%)] mb-3 md:mb-4">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-[#C5A880]" />
            <span>{vendor.location}</span>
          </div>

          {/* Desktop Pricing & CTA */}
          <div className="hidden md:flex items-center justify-between pt-4 border-t border-gray-50">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                Starting Price
              </span>
              <span className="text-base font-bold text-[#8B263E]">
                {vendor.priceStart > 0 ? `₹${vendor.priceStart}L Onwards` : "Price on Request"}
              </span>
            </div>
            <Link
              href={`/vendors/${vendor.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="px-4 py-2 rounded-full text-xs font-bold text-[#C5A880] bg-[#8B263E]/5 hover:bg-[#8B263E] hover:text-white transition-all duration-300"
            >
              Profile
            </Link>
          </div>

          {/* Mobile Pricing & Compact Actions */}
          <div className="md:hidden pt-3 border-t border-gray-50 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase font-bold text-neutral-600 tracking-wider">
                Starting Price
              </span>
              <span className="text-xs font-bold text-[#8B263E]">
                {vendor.priceStart > 0 ? `₹${vendor.priceStart}L Onwards` : "Price on Request"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/vendors/${vendor.slug}`);
                }}
                className="py-2.5 rounded-lg text-[11px] font-bold text-center bg-neutral-100 text-neutral-800 hover:bg-neutral-200 transition-colors"
              >
                Profile
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/vendors/${vendor.slug}#contact`);
                }}
                className="py-2.5 rounded-lg text-[11px] font-bold text-center bg-[#8B263E]/10 text-[#8B263E] hover:bg-[#8B263E] hover:text-white transition-colors"
              >
                Get Quote
              </button>
            </div>
          </div>

          {onRemove && (
            <div className="pt-3 mt-2 border-t border-gray-100">
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
          <div className="flex items-center justify-between text-white pt-2">
            <span className="text-xs font-bold truncate max-w-[70%]">{vendor.name}</span>
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

          <div
            className="relative flex-1 my-auto w-full flex items-center justify-center select-none"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <Image
              src={
                brokenUrls[images[currentImgIndex] || ""]
                  ? fallbackImage
                  : images[currentImgIndex] || vendor.imageUrl || fallbackImage
              }
              alt={vendor.name}
              fill
              sizes="(max-width: 1024px) 100vw, 90vw"
              quality={85}
              className="object-contain"
            />
          </div>

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
