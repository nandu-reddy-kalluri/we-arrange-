"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { FooterBrand } from "./FooterBrand";
import { FooterNavigation } from "./FooterNavigation";
import { FooterSocials } from "./FooterSocials";
import { FooterWaveTransition } from "../FooterWaveTransition";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <div className="hidden md:block">
        <FooterWaveTransition />
      </div>

      <footer className="relative w-full overflow-hidden">
        
        {/* MOBILE SUBTLE TRANSITION */}
        <div className="md:hidden h-24 bg-gradient-to-b from-[#FBF9F6] to-[#120004]" />

        <div className="bg-[#120004] pt-2 pb-6 md:pt-6 md:pb-4 relative w-full">
          {/* Huge Background Watermark (Desktop Only) */}
          <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-serif font-black text-[180px] leading-none text-white opacity-[0.03] pointer-events-none select-none z-0 whitespace-nowrap">
            YW
          </div>

          {/* ── DESKTOP FOOTER (UNCHANGED) ── */}
          <div className="hidden md:flex max-w-7xl mx-auto px-6 lg:px-8 w-full flex-col items-center h-full relative z-10">
            <FooterBrand />
            <div className="w-full max-w-md h-[1px] bg-gradient-to-r from-transparent via-[#C89B3C]/30 to-transparent mb-4" />
            <div className="flex flex-row items-center justify-between w-full mt-auto gap-0">
              <FooterNavigation />
              <div className="flex-1 text-center">
                <span className="text-[9px] uppercase tracking-[0.3em] font-black text-white/20 block">
                  © {currentYear} YouMarriage We Arrange
                </span>
                <span className="text-[8px] uppercase tracking-[0.2em] font-medium text-white/10 mt-1 block">
                  Crafting unforgettable celebrations.
                </span>
              </div>
              <FooterSocials />
            </div>
          </div>

          {/* ── YOUMARRIAGE SIGNATURE MOBILE FOOTER ── */}
          <div className="flex md:hidden flex-col items-center text-center px-6 py-2 space-y-4 relative z-10 w-full">
            {/* Brand Wordmark & Tagline */}
            <div className="flex flex-col items-center">
              <span className="font-serif text-2xl font-bold text-white tracking-tight leading-none">
                YouMarriage
              </span>
              <span className="font-sans text-[9px] font-black text-[#C89B3C] tracking-[0.4em] uppercase mt-1">
                WE ARRANGE
              </span>
              <p className="font-serif italic text-xs text-[#C89B3C]/90 max-w-xs mt-2">
                &quot;Your celebration begins with the right choices.&quot;
              </p>
            </div>

            {/* Signature Star Motif */}
            <span className="text-[#C89B3C] text-sm select-none">✦</span>

            {/* Primary CTA */}
            <a
              href="#hero"
              className="px-6 py-2.5 rounded-full bg-[#8B263E] text-white text-[11px] font-bold uppercase tracking-widest shadow-md active:scale-[0.98] transition-all flex items-center gap-1.5"
            >
              Start Planning <ArrowRight className="w-3 h-3 text-[#C89B3C]" />
            </a>

            {/* Simple Flowing Navigation */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] font-bold uppercase tracking-wider text-white/80 pt-2 pb-1">
              <a href="/venues" className="hover:text-[#C89B3C] transition-colors">Venues</a>
              <span className="text-[#C89B3C]/40">•</span>
              <a href="/vendors" className="hover:text-[#C89B3C] transition-colors">Vendors</a>
              <span className="text-[#C89B3C]/40">•</span>
              <a href="/wedding-studio" className="hover:text-[#C89B3C] transition-colors">Studio</a>
              <span className="text-[#C89B3C]/40">•</span>
              <a href="/inspiration" className="hover:text-[#C89B3C] transition-colors">Inspiration</a>
            </div>

            {/* Social Icons */}
            <div className="pt-2">
              <FooterSocials />
            </div>

            {/* Legal Links & Copyright */}
            <div className="flex flex-col items-center gap-1.5 pt-3 text-[9px] font-medium text-white/30 tracking-wider">
              <span>© {currentYear} YouMarriage We Arrange</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
