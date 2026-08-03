"use client";

import React from "react";

/**
 * Reusable SVG Horizon Wave Transition that seamlessly melts light-themed
 * page sections into the dark (#120004) footer, exactly matching the homepage benchmark.
 */
export function FooterWaveTransition() {
  return (
    <div className="relative w-full overflow-hidden leading-none z-10 pointer-events-none -mb-[1px]">
      {/* Soft Golden Horizon Glow */}
      <div className="absolute bottom-[20%] left-0 w-full h-[150px] bg-gradient-to-t from-[#C89B3C]/30 to-transparent blur-3xl mix-blend-overlay pointer-events-none" />
      
      <svg 
        viewBox="0 0 1200 120" 
        preserveAspectRatio="none" 
        className="relative block w-full h-[80px] md:h-[140px]"
        style={{ filter: "drop-shadow(0px -15px 25px rgba(200,155,60,0.15))" }}
      >
        <path 
          d="M0,0 C300,120 900,-60 1200,60 L1200,120 L0,120 Z" 
          fill="#120004"
        />
      </svg>
    </div>
  );
}
