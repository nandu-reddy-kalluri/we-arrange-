"use client";

import React from "react";
import { FooterBrand } from "./FooterBrand";
import { FooterNavigation } from "./FooterNavigation";
import { FooterSocials } from "./FooterSocials";
import { FooterWaveTransition } from "../FooterWaveTransition";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <FooterWaveTransition />
      <footer className="relative w-full bg-[#120004] overflow-hidden pt-6 pb-4 flex flex-col justify-between">
        
        {/* Huge Background Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-serif font-black text-[150px] md:text-[180px] leading-none text-white opacity-[0.03] pointer-events-none select-none z-0 whitespace-nowrap">
          YW
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full flex flex-col items-center h-full relative z-10">
          
          <FooterBrand />

          {/* Thin Champagne Divider */}
          <div className="w-full max-w-md h-[1px] bg-gradient-to-r from-transparent via-[#C89B3C]/30 to-transparent mb-4" />

          {/* BOTTOM: Navigation & Socials */}
          <div className="flex flex-col md:flex-row items-center justify-between w-full mt-auto gap-5 md:gap-0">
            
            {/* Left: Navigation */}
            <FooterNavigation />

            {/* Center: Copyright (Desktop) */}
            <div className="hidden md:block flex-1 text-center">
              <span className="text-[9px] uppercase tracking-[0.3em] font-black text-white/20 block">
                © {currentYear} YouMarriage We Arrange
              </span>
              <span className="text-[8px] uppercase tracking-[0.2em] font-medium text-white/10 mt-1 block">
                Crafting unforgettable celebrations.
              </span>
            </div>

            {/* Right: Floating Glass Bubbles */}
            <FooterSocials />

            {/* Center: Copyright (Mobile) */}
            <div className="block md:hidden mt-4 text-center">
              <span className="text-[8px] uppercase tracking-[0.3em] font-black text-white/20 block">
                © {currentYear} YouMarriage We Arrange
              </span>
              <span className="text-[7px] uppercase tracking-[0.2em] font-medium text-white/10 mt-1 block">
                Crafting unforgettable celebrations.
              </span>
            </div>

          </div>
        </div>
      </footer>
    </>
  );
}
