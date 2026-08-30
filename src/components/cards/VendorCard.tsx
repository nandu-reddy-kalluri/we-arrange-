"use client";

import React from "react";
import Link from "next/link";
import { Star, MapPin } from "lucide-react";
import { Vendor } from "@/mock-data/vendors";

import { ChevronLeft, ChevronRight, X } from "lucide-react";

export default function VendorCard({ vendor }: { vendor: Vendor }) {
  const images = React.useMemo(() => {
    const list = Array.from(
      new Set([vendor.imageUrl, vendor.logoUrl, "/images/editorial/vendor_photography.png", "/images/editorial/vendor_decoration.png", "/images/editorial/vendor_makeup.png", "/images/editorial/insp_bridal.png"].filter(Boolean))
    ) as string[];
    return list;
  }, [vendor]);

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
      <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-[0_8px_32px_0_rgba(25,45,50,0.02)] hover:shadow-premium hover:-translate-y-1 transition-all duration-300">
        {/* Image Container with Touch Swipe on Mobile */}
        <div
          className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100 select-none cursor-pointer"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={() => {
            if (!touchStartRef.current) {
              setIsModalOpen(true);
            }
          }}
        >
          <img
            src={images[currentImgIndex] || vendor.imageUrl}
            alt={vendor.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute top-3 left-3 md:top-4 md:left-4 bg-white/90 backdrop-blur-md px-2.5 py-1 md:px-3.5 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-bold text-[hsl(340,60%,15%)] uppercase tracking-wider shadow-sm z-10">
            {vendor.category}
          </div>

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
            <div className="grid grid-cols-3 gap-2">
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
              <Link
                href={`/vendors/${vendor.slug}`}
                onClick={(e) => e.stopPropagation()}
                className="py-2.5 rounded-lg text-[11px] font-bold text-center bg-[#8B263E] text-white hover:bg-[#6e1c2f] transition-colors flex items-center justify-center"
              >
                View
              </Link>
            </div>
          </div>
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
