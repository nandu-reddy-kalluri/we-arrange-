"use client";

import React from "react";

export function HeroTexture() {
  return (
    <div className="absolute inset-0 z-30 pointer-events-none opacity-[0.06] mix-blend-overlay">
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <filter id="luxurySilkFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch"/>
          <feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.08 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#luxurySilkFilter)"/>
      </svg>
    </div>
  );
}
