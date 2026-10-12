"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, MapPin, ChevronLeft, ChevronRight, X, Heart, Trash2 } from "lucide-react";
import { Vendor } from "@/mock-data/vendors";
import { useSavedStore } from "@/store/useSavedStore";

export default function VendorCard({ vendor, onRemove }: { vendor: Vendor; onRemove?: () => void }) {
  const router = useRouter();
  const { isVendorSaved, toggleSaveVendor } = useSavedStore();

  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => setIsMounted(true), []);
  const isSaved = isMounted ? isVendorSaved(vendor.id) : false;

  const images = React.useMemo(() => {
    const list = Array.from(
      new Set([vendor.imageUrl, vendor.logoUrl, "/images/editorial/vendor_photography.png", "/images/editorial/vendor_decoration.png", "/images/editorial/vendor_makeup.png", "/images/editorial/insp_bridal.png"].filter(Boolean))
    ) as string[];
    return list;
  }, [vendor]);

  const [currentImgIndex, setCurrentImgIndex] = React.useState(0);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const touchStartRef = React.useRef<{ x: number; y: number } | null>(null);
  const isSwipingRef = React.useRef(false);

  // Automatic image slider: every 3000ms (3 seconds) on mobile view only
  React.useEffect(() => {
    if (images.length <= 1) return;

    const isMobile = () => typeof window !== "undefined" && window.innerWidth < 768;
    let interval: NodeJS.Timeout | null = null;

    const updateSlider = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      if (isMobile()) {
        interval = setInterval(() => {
          setCurrentImgIndex((prev) => (prev + 1) % images.length);
        }, 3000);
      }
    };

    updateSlider();
    window.addEventListener("resize", updateSlider);

    return () => {
      if (interval) clearInterval(interval);
      window.removeEventListener("resize", updateSlider);
    };
  }, [images.length]);

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
          className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100 select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {images.map((imgUrl, idx) => (
            <img
              key={imgUrl + idx}
              src={imgUrl}
              alt={vendor.name}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-in-out group-hover:scale-105 ${
                idx === currentImgIndex ? "opacity-100 z-0" : "opacity-0 pointer-events-none"
              }`}
              loading="lazy"
            />
          ))}

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
              className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm z-10"
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
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      idx === currentImgIndex ? "bg-white scale-125" : "bg-white/50"
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
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

        {/* Details */}
        <div className="p-3.5 md:p-6">
          <div className="flex items-center justify-between mb-1.5 md:mb-2">
            <h3 className="font-serif text-sm md:text-base font-bold text-[#2D2D2D] truncate group-hover:text-[#C5A880] transition-colors duration-200">
              {vendor.name}
            </h3>
            <div className="flex items-center gap-1 text-xs font-bold text-[#2D2D2D]">
              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
              <span>{vendor.rating}</span>
            </div>
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
                ₹{vendor.priceStart}L Onwards
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
              <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">
                Starting Price
              </span>
              <span className="text-xs font-bold text-[#8B263E]">
                ₹{vendor.priceStart}L Onwards
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <a
                href="tel:+919876543210"
                onClick={(e) => e.stopPropagation()}
                className="py-2.5 rounded-lg text-[11px] font-bold text-center bg-neutral-100 text-neutral-800 hover:bg-neutral-200 transition-colors"
              >
                Call
              </a>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  alert(`Quote requested for ${vendor.name}`);
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
            <img
              src={images[currentImgIndex] || vendor.imageUrl}
              alt={vendor.name}
              className="max-h-[80vh] max-w-full object-contain rounded-lg"
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
