"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Monitor, Smartphone, Globe, CloudLightning } from "lucide-react";

export default function WebsiteSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Connect scroll to parallax movement
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const desktopY = useTransform(scrollYProgress, [0, 1], [-20, 20]);
  const mobileY = useTransform(scrollYProgress, [0, 1], [30, -30]);

  return (
    <section ref={containerRef} className="py-20 lg:py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Block: (lg:col-span-5) */}
          <div className="lg:col-span-5 text-left flex flex-col gap-6">
            <div>
              <span className="font-sans text-[10px] font-black uppercase text-accent-gold tracking-[0.25em] block mb-2">
                CHOOSE • Premium Wedding Websites
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-neutral-charcoal leading-tight">
                Premium Wedding Websites
              </h2>
              <div className="w-12 h-[2px] bg-gradient-to-r from-accent-gold to-primary mt-3" />
            </div>

            <p className="text-sm font-medium text-neutral-muted leading-relaxed">
              Share your love story, publish event coordinates, manage registry lists, and capture high-resolution photo dumps from your guests. Every website is custom-coded, responsive, and ad-free.
            </p>

            {/* List of features */}
            <div className="space-y-4 my-2">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/5 flex items-center justify-center shrink-0 mt-0.5 text-primary">
                  <Globe className="w-3 h-3" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-charcoal">Bespoke Subdomains</h4>
                  <p className="text-[11px] font-semibold text-gray-400">e.g. youmarriagewearrange.com/aria-rohan</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/5 flex items-center justify-center shrink-0 mt-0.5 text-primary">
                  <CloudLightning className="w-3 h-3" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-charcoal">Live Photo Uploads</h4>
                  <p className="text-[11px] font-semibold text-gray-400">Guests scan QR codes at the venue to upload pictures directly.</p>
                </div>
              </div>
            </div>

            <button
              suppressHydrationWarning={true}
              className="px-7 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest text-neutral-cream bg-gradient-to-r from-neutral-charcoal to-black hover:scale-[1.02] transition-all w-fit shadow-md"
            >
              Explore Live Themes
            </button>
          </div>

          {/* Right Visual block: Parallax Mockups (lg:col-span-7) */}
          <div className="lg:col-span-7 bg-neutral-cream rounded-3xl p-8 border border-neutral-border relative flex items-center justify-center min-h-[420px] overflow-hidden">
            
            {/* Desktop Mockup Frame */}
            <motion.div
              style={{ y: desktopY }}
              className="w-[85%] aspect-[16/10] bg-white rounded-2xl shadow-xl border border-neutral-border overflow-hidden p-1 flex flex-col z-10"
            >
              {/* Web Browser Bar */}
              <div className="h-4 bg-neutral-cream w-full flex items-center gap-1.5 px-2.5 shrink-0 border-b border-neutral-border">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
              {/* Website content */}
              <div className="w-full flex-grow p-4 flex flex-col justify-between relative bg-cover bg-center" style={{ backgroundImage: `url('/images/editorial/venue_1.png')` }}>
                <div className="absolute inset-0 bg-black/45 z-0" />
                <div className="z-10 text-left pt-2">
                  <span className="font-serif text-[10px] text-accent-gold tracking-widest block uppercase">Join Our Joy</span>
                  <h4 className="font-serif text-base sm:text-xl font-bold text-white mt-1 leading-tight">Anjali & Karan</h4>
                </div>
                <div className="z-10 flex justify-between items-end border-t border-white/20 pt-2 text-[9px] text-white/80">
                  <span>Chowmahalla Palace, Hyd</span>
                  <span>12 Dec 2026</span>
                </div>
              </div>
            </motion.div>

            {/* Mobile Mockup Frame (Overlapping, slides faster) */}
            <motion.div
              style={{ y: mobileY }}
              className="absolute bottom-6 right-6 w-[36%] aspect-[9/16] bg-white rounded-[1.8rem] shadow-2xl border-4 border-neutral-charcoal p-1 flex flex-col z-20 shrink-0"
            >
              <div className="w-full h-full bg-neutral-cream rounded-[1.4rem] overflow-hidden p-3 flex flex-col justify-between border border-accent-gold/30 relative text-center">
                <div className="absolute inset-1.5 border border-accent-gold/15 rounded-[1.2rem] pointer-events-none" />
                <div className="pt-4 z-10 flex flex-col items-center">
                  <span className="font-serif text-[7px] text-accent-gold tracking-wider uppercase">Our Story</span>
                  <h5 className="font-serif text-xs font-black text-primary mt-0.5">A & K</h5>
                </div>
                <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-border mx-auto border border-accent-gold/20 z-10 my-2">
                  <img
                    src="/images/editorial/insp_photography.png"
                    alt="Couple mobile preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="pb-3 z-10">
                  <span className="text-[6px] text-gray-400 block uppercase font-bold">12.12.2026</span>
                </div>
              </div>
            </motion.div>

          </div>

        </div>
      </div>
    </section>
  );
}
