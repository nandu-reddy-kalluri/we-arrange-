"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DynamicGridGallery } from "@/components/ui/DynamicGridGallery";

interface RealWeddingGalleryProps {
  title: string;
  coupleNames: string;
  gallery: string[];
}

const DEFAULT_WEDDING_FALLBACK = "/images/editorial/hero_venue.png";

export function RealWeddingGallery({
  title,
  coupleNames,
  gallery,
}: RealWeddingGalleryProps) {
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  const images = gallery && gallery.length > 0 ? gallery : [DEFAULT_WEDDING_FALLBACK];

  const handlePrevImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveLightboxIndex((prev) => {
      if (prev === null || prev <= 0) return prev;
      return prev - 1;
    });
  }, []);

  const handleNextImage = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setActiveLightboxIndex((prev) => {
        if (prev === null || prev >= images.length - 1) return prev;
        return prev + 1;
      });
    },
    [images.length]
  );

  const isFirstImage = activeLightboxIndex === 0;
  const isLastImage =
    activeLightboxIndex !== null && activeLightboxIndex === images.length - 1;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeLightboxIndex === null) return;
      if (e.key === "ArrowLeft") handlePrevImage();
      if (e.key === "ArrowRight") handleNextImage();
      if (e.key === "Escape") setActiveLightboxIndex(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeLightboxIndex, handlePrevImage, handleNextImage]);

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

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

    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0 && !isFirstImage) {
        handlePrevImage();
      } else if (deltaX < 0 && !isLastImage) {
        handleNextImage();
      }
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-serif text-3xl text-neutral-900">Wedding Album</h2>
        <span className="text-sm font-sans font-medium text-neutral-500 uppercase tracking-widest">
          {images.length} Photos
        </span>
      </div>

      {/* Dynamic Expandable Grid Gallery */}
      <DynamicGridGallery
        items={images}
        fallbackSrc={DEFAULT_WEDDING_FALLBACK}
        gap={12}
        expandFactor={1.85}
        rounded="rounded-[22px]"
        itemRounded="rounded-xl"
        aspectRatioClass="h-[320px] sm:h-[400px] md:h-[480px]"
        totalCount={images.length}
        showViewAllButton={images.length > 0}
        viewAllLabel={`View All Photos (${images.length})`}
        onItemClick={(_item, idx) => setActiveLightboxIndex(idx)}
        onViewAllClick={() => setActiveLightboxIndex(0)}
      />

      {/* Interactive Lightbox Modal */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {activeLightboxIndex !== null && images[activeLightboxIndex] && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveLightboxIndex(null)}
                className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 md:p-6 pb-6 md:pb-8 select-none overflow-hidden"
              >
                {/* Header */}
                <div
                  className="flex items-center justify-between text-white z-10 mb-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-serif text-sm md:text-base font-bold truncate max-w-[200px] sm:max-w-md">
                      {coupleNames} • {title}
                    </span>
                    <span className="text-[10px] md:text-xs font-mono font-bold bg-white/10 px-3 py-1 rounded-full text-white/90">
                      {activeLightboxIndex + 1} / {images.length}
                    </span>
                  </div>

                  <button
                    onClick={() => setActiveLightboxIndex(null)}
                    className="p-2.5 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
                    aria-label="Close gallery"
                  >
                    <X className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                </div>

                {/* Main Image Stage */}
                <div
                  className="relative flex-1 my-auto w-full flex items-center justify-center overflow-hidden min-h-0"
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  onClick={(e) => e.stopPropagation()}
                >
                  {!isFirstImage && (
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 p-3 md:p-4 bg-black/60 hover:bg-[#8B263E] text-white rounded-full backdrop-blur-md border border-white/15 transition-all z-20 cursor-pointer shadow-lg"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                  )}

                  <motion.div
                    key={activeLightboxIndex}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.25 }}
                    className="relative max-w-5xl max-h-[55vh] md:max-h-[62vh] w-full h-full flex items-center justify-center pointer-events-none"
                  >
                    <img
                      src={images[activeLightboxIndex] || DEFAULT_WEDDING_FALLBACK}
                      alt={`${coupleNames} wedding photo ${activeLightboxIndex + 1}`}
                      className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
                      draggable={false}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = DEFAULT_WEDDING_FALLBACK;
                      }}
                    />
                  </motion.div>

                  {!isLastImage && (
                    <button
                      onClick={handleNextImage}
                      className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 p-3 md:p-4 bg-black/60 hover:bg-[#8B263E] text-white rounded-full backdrop-blur-md border border-white/15 transition-all z-20 cursor-pointer shadow-lg"
                      aria-label="Next photo"
                    >
                      <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                  )}
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div
                    className="w-full max-w-5xl mx-auto flex items-center gap-2 overflow-x-auto py-2 px-4 hide-scrollbar z-10 justify-start sm:justify-center mt-2 mb-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {images.map((thumbUrl, idx) => (
                      <button
                        key={`${thumbUrl}-${idx}`}
                        onClick={() => setActiveLightboxIndex(idx)}
                        className={`relative w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                          idx === activeLightboxIndex
                            ? "border-[#C5A880] scale-105 shadow-md opacity-100"
                            : "border-transparent opacity-50 hover:opacity-80"
                        }`}
                      >
                        <img
                          src={thumbUrl}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = DEFAULT_WEDDING_FALLBACK;
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}

export default RealWeddingGallery;
