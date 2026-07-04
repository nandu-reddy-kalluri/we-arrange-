"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { VendorCategory } from "@/mock-data/vendors";

const CATEGORY_METRICS: Record<string, string> = {
  photography: "120+ Concierge Vetted",
  decor: "80+ Curated Designers",
  catering: "60+ Premium Caterers",
  makeup: "150+ Top Stylists",
  "wedding-planning": "45+ Specialists",
  mehendi: "90+ Master Artists",
};

export function VendorScroller({ categories }: { categories: VendorCategory[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div 
        ref={containerRef}
        className="flex md:hidden overflow-x-auto gap-3 pb-4 scrollbar-none snap-x snap-mandatory touch-pan-x"
        style={{ scrollbarWidth: "none" }}
      >
        {categories.map((category) => {
          const countStr = CATEGORY_METRICS[category.slug] || "50+ Vetted Partners";
          return (
            <Link
              key={category.id}
              href={`/vendors/${category.slug}`}
              className="flex items-center gap-3 bg-white border border-neutral-border px-4 py-3 min-h-[56px] rounded-full shadow-sm snap-start shrink-0 hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 relative bg-neutral-cream">
                <Image
                  src={category.imageUrl}
                  alt={category.name}
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              </div>
              <div className="text-left">
                <span className="block text-xs font-black text-neutral-charcoal leading-tight">
                  {category.name}
                </span>
                <span className="block text-[8px] font-bold text-neutral-muted uppercase tracking-wide">
                  {countStr}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-6 gap-6 justify-items-center">
        {categories.map((category) => {
          const countStr = CATEGORY_METRICS[category.slug] || "50+ Vetted Partners";
          return (
            <Link
              key={category.id}
              href={`/vendors/${category.slug}`}
              className="flex flex-col items-center gap-4 group cursor-pointer w-full text-center focus:outline-none"
            >
              <div className="relative w-28 h-28 lg:w-32 lg:h-32 rounded-full flex items-center justify-center">
                <div className="absolute inset-[-4px] rounded-full border border-dashed border-accent-gold/40 group-hover:border-primary/60 group-hover:rotate-90 transition-transform duration-[1200ms] ease-out pointer-events-none" />
                <div className="w-full h-full rounded-full p-[2px] bg-gradient-to-tr from-accent-gold/20 via-transparent to-primary/10 group-hover:from-accent-gold group-hover:to-primary transition-all duration-500 shadow-sm group-hover:shadow-lg flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-neutral-cream p-[3px] flex items-center justify-center">
                    <div className="w-full h-full rounded-full overflow-hidden bg-neutral-cream relative">
                      <Image
                        src={category.imageUrl}
                        alt={category.name}
                        fill
                        sizes="(max-width: 1024px) 112px, 128px"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-300" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-0.5 items-center">
                <span className="font-serif text-sm lg:text-base font-bold text-neutral-charcoal group-hover:text-primary transition-colors duration-300">
                  {category.name}
                </span>
                <span className="text-[9px] font-black text-neutral-muted uppercase tracking-wider">
                  {countStr}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
