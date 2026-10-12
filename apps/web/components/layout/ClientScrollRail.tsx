"use client";

import React, { useState, useEffect, useRef } from "react";

export function ClientScrollRail() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [footerOverlapOffset, setFooterOverlapOffset] = useState(0);
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Active section indicator logic
          const vendorsEl = document.getElementById("featured-vendors");
          if (vendorsEl) {
            const vendorsRect = vendorsEl.getBoundingClientRect();
            const vendorsTop = vendorsRect.top + window.scrollY;
            const maxScroll = Math.max(1, vendorsTop - window.innerHeight * 0.35);
            
            const currentScroll = window.scrollY;
            const rawProgress = currentScroll / maxScroll;
            const clamped = Math.max(0, Math.min(1, rawProgress));
            
            if (clamped >= 0.85) setActiveIndex(3);
            else if (clamped >= 0.55) setActiveIndex(2);
            else if (clamped >= 0.25) setActiveIndex(1);
            else setActiveIndex(0);
          } else {
            setActiveIndex(0);
          }

          // Prevent dark footer section (including wave transition) from overlapping menu card
          const footerEl = document.querySelector("footer");
          if (footerEl && railRef.current) {
            const waveEl = footerEl.previousElementSibling;
            const darkTop = waveEl ? waveEl.getBoundingClientRect().top : footerEl.getBoundingClientRect().top;
            
            // Calculate unshifted bottom position of the menu card
            const currentRailBottom = railRef.current.getBoundingClientRect().bottom;
            const currentOffset = parseFloat(railRef.current.dataset.offset || "0");
            const unshiftedCardBottom = currentRailBottom + currentOffset;

            const buffer = 28; // 28px buffer above dark footer wave
            if (darkTop < unshiftedCardBottom + buffer) {
              const neededOffset = (unshiftedCardBottom + buffer) - darkTop;
              setFooterOverlapOffset(neededOffset);
              railRef.current.dataset.offset = String(neededOffset);
            } else {
              setFooterOverlapOffset(0);
              railRef.current.dataset.offset = "0";
            }
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div 
      ref={railRef}
      data-offset="0"
      className="hidden 2xl:flex fixed left-6 top-1/2 flex-col z-40 items-start select-none bg-white/90 backdrop-blur-md border border-[#E8D8BC]/60 rounded-2xl py-4 px-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-md"
      style={{
        transform: `translateY(calc(-50% - ${footerOverlapOffset}px))`
      }}
    >
      <div className="relative pl-5 flex flex-col gap-6">
        <button 
          onClick={() => document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" })} 
          className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors ${activeIndex === 0 ? "text-[#8B263E]" : "text-neutral-500 hover:text-neutral-900"}`}
        >
          Dream
        </button>
        <button 
          onClick={() => document.getElementById("concierge-journey")?.scrollIntoView({ behavior: "smooth" })} 
          className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors ${activeIndex === 1 ? "text-[#8B263E]" : "text-neutral-500 hover:text-neutral-900"}`}
        >
          Journey
        </button>
        <button 
          onClick={() => document.getElementById("featured-venues")?.scrollIntoView({ behavior: "smooth" })} 
          className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors ${activeIndex === 2 ? "text-[#8B263E]" : "text-neutral-500 hover:text-neutral-900"}`}
        >
          Venues
        </button>
        <button 
          onClick={() => document.getElementById("featured-vendors")?.scrollIntoView({ behavior: "smooth" })} 
          className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors ${activeIndex === 3 ? "text-[#8B263E]" : "text-neutral-500 hover:text-neutral-900"}`}
        >
          Vendors
        </button>
      </div>
    </div>
  );
}
