"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  type GalleryItem,
  DEFAULT_FALLBACK_IMAGE,
  DEFAULT_GALLERY_ITEMS,
  normalizeGalleryItems,
  calculateGridTemplate,
} from "./dynamicGalleryData";

export type { GalleryItem };
export { DEFAULT_GALLERY_ITEMS };

export interface DynamicGridGalleryProps {
  /** Array of image URLs (string[]) or GalleryItem objects */
  items?: (string | GalleryItem)[];
  /** Default/fallback image URL for broken links */
  fallbackSrc?: string;
  /** Grid gap in pixels (default: 12) */
  gap?: number;
  /** Hover expansion ratio for active row/col (default: 1.85) */
  expandFactor?: number;
  /** Border radius tailwind class for the outer container (default: "rounded-[22px]") */
  rounded?: string;
  /** Border radius tailwind class for inner image cells (default: "rounded-xl") */
  itemRounded?: string;
  /** Custom container class */
  className?: string;
  /** Container height or aspect ratio class (default: "h-[300px] sm:h-[380px] md:h-[450px]") */
  aspectRatioClass?: string;
  /** Total count of images in complete album/gallery */
  totalCount?: number;
  /** Whether to show the floating "View All Photos" button */
  showViewAllButton?: boolean;
  /** Custom label for "View All Photos" button */
  viewAllLabel?: string;
  /** Callback when an image is clicked */
  onItemClick?: (item: GalleryItem, index: number) => void;
  /** Callback when "View All Photos" is clicked */
  onViewAllClick?: () => void;
  /** Prioritize eager loading for the first images */
  priorityFirst?: boolean;
}

/**
 * DynamicGridGallery — Reusable interactive hover-expandable grid gallery for YMWA.
 * Adapts to 1, 2, 3, 4, 5, or 6+ images with smooth 500ms transitions, mobile stability,
 * graceful fallback handling, and lightbox triggers.
 */
export function DynamicGridGallery({
  items,
  fallbackSrc = DEFAULT_FALLBACK_IMAGE,
  gap = 12,
  expandFactor = 1.85,
  rounded = "rounded-[22px]",
  itemRounded = "rounded-xl",
  className = "",
  aspectRatioClass = "h-[300px] sm:h-[380px] md:h-[450px]",
  totalCount,
  showViewAllButton = true,
  viewAllLabel,
  onItemClick,
  onViewAllClick,
  priorityFirst = true,
}: DynamicGridGalleryProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [failedIndices, setFailedIndices] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasTouch =
        window.matchMedia("(pointer: coarse)").matches ||
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0;
      setIsTouchDevice(hasTouch);
    }
  }, []);

  const normalizedItems = useMemo(() => {
    const raw = normalizeGalleryItems(items, fallbackSrc);
    return raw.length > 0 ? raw : normalizeGalleryItems(DEFAULT_GALLERY_ITEMS, fallbackSrc);
  }, [items, fallbackSrc]);

  // Max 6 visible cells in the dynamic grid
  const visibleItems = useMemo(() => {
    return normalizedItems.slice(0, 6);
  }, [normalizedItems]);

  const count = visibleItems.length;
  const effectiveTotal = totalCount ?? normalizedItems.length;

  const gridTemplate = useMemo(() => {
    return calculateGridTemplate(count, hoveredIndex, isTouchDevice, expandFactor);
  }, [count, hoveredIndex, isTouchDevice, expandFactor]);

  if (visibleItems.length === 0) {
    return null;
  }

  const handleImageError = (index: number) => {
    setFailedIndices((prev) => ({ ...prev, [index]: true }));
  };

  return (
    <div
      className={`relative w-full overflow-hidden select-none shadow-md bg-neutral-900/5 ${rounded} ${aspectRatioClass} ${className}`}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      {/* Dynamic Grid Container with 500ms smooth transitions */}
      <div
        className="w-full h-full grid transition-[grid-template-columns,grid-template-rows] duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
        style={{
          gridTemplateColumns: gridTemplate.gridTemplateColumns,
          gridTemplateRows: gridTemplate.gridTemplateRows,
          gap: `${gap}px`,
        }}
      >
        {visibleItems.map((item, index) => {
          const isHovered = hoveredIndex === index;
          const isFailed = failedIndices[index];
          const imageSrc = isFailed ? fallbackSrc : item.src;

          // For count === 5, item 0 spans row 1 & row 2 (left column hero showcase)
          const cellLayoutClass =
            count === 5 && index === 0 ? "row-span-2 col-start-1 row-start-1" : "";

          return (
            <div
              key={item.id ?? index}
              onMouseEnter={() => {
                if (!isTouchDevice) {
                  setHoveredIndex(index);
                }
              }}
              onClick={() => onItemClick?.(item, index)}
              className={`relative w-full h-full overflow-hidden ${itemRounded} cursor-pointer select-none bg-neutral-900 group ${cellLayoutClass}`}
              role="button"
              tabIndex={0}
              aria-label={item.alt || `View photo ${index + 1}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onItemClick?.(item, index);
                }
              }}
            >
              <Image
                src={imageSrc}
                alt={item.alt || item.title || `Gallery photo ${index + 1}`}
                fill
                priority={priorityFirst && index === 0}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                onError={() => handleImageError(index)}
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 filter brightness-[0.98] contrast-[1.03]"
              />

              {/* Ambient lighting vignette */}
              <div
                className={`absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10 transition-opacity duration-300 pointer-events-none ${
                  isHovered ? "opacity-15" : "opacity-45"
                }`}
              />

              {/* Hover indicator pill for accessible discovery */}
              <div
                className={`absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold text-white uppercase tracking-wider transition-opacity duration-200 pointer-events-none ${
                  isHovered ? "opacity-100" : "opacity-0"
                }`}
              >
                Expand Photo
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating "View All Photos" Button */}
      {showViewAllButton && effectiveTotal > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewAllClick ? onViewAllClick() : onItemClick?.(visibleItems[0], 0);
          }}
          className="absolute bottom-4 right-4 bg-white/95 hover:bg-white text-neutral-charcoal backdrop-blur-md border border-[#E8D8BC] text-[10px] md:text-xs font-black uppercase tracking-wider px-3.5 py-2 md:px-4 md:py-2.5 rounded-xl shadow-lg hover:border-[#C5A880] hover:text-[#8B263E] transition-all cursor-pointer z-10 flex items-center gap-1.5 active:scale-95"
          aria-label={viewAllLabel || `View all ${effectiveTotal} photos`}
        >
          <span>{viewAllLabel || `View All Photos (${effectiveTotal})`}</span>
        </button>
      )}
    </div>
  );
}

export default DynamicGridGallery;
