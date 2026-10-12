"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { typography } from "@/styles/typography";

export function WeddingStudioHero() {
  return (
    <section className="relative pt-24 pb-12 md:pt-32 md:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
        
        {/* Left Content Column (7 cols) */}
        <div className="w-full lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left z-10">
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex items-center gap-3 mb-6"
          >
            <span className="block h-px w-8 bg-gradient-to-r from-[#C5A880] to-transparent lg:hidden" />
            <span className="font-sans text-[10px] sm:text-[11px] font-black uppercase text-[#C5A880] tracking-[0.3em]">
              WEDDING STUDIO
            </span>
            <span className="block h-px w-8 bg-gradient-to-l from-[#C5A880] to-transparent lg:w-16 lg:bg-gradient-to-r" />
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif text-[clamp(38px,5.5vw,68px)] text-neutral-900 leading-[1.08] tracking-tight font-medium mb-6"
          >
            Create. Personalize.<br />
            <span className="text-[#8B263E]">Celebrate Beautifully.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-base md:text-lg text-neutral-600 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed mb-10"
          >
            Design stunning eInvites and beautiful wedding websites that tell your unique love story with seamless RSVP management.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-stretch sm:flex-row sm:items-center gap-3 mb-10 w-full sm:w-auto"
          >
            <Link 
              href="#products"
              className="px-8 py-3.5 sm:py-4 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-widest text-white bg-[#8B263E] hover:bg-[#6e1c2f] transition-all duration-300 shadow-[0_8px_20px_-8px_rgba(139,38,62,0.5)] flex items-center gap-2 group justify-center"
            >
              Start Creating
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              href="#templates"
              className="px-8 py-3.5 sm:py-4 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-widest text-neutral-700 bg-white/50 hover:bg-white border border-[#C5A880]/20 hover:border-[#C5A880]/40 transition-all duration-300 justify-center flex shadow-sm"
            >
              Explore Templates
            </Link>
          </motion.div>

          {/* Minimal Mobile Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-[13px] font-medium text-neutral-500 flex items-center gap-2"
          >
            <span className="text-[#C5A880]">✦</span> Designed for modern Indian weddings
          </motion.div>

        </div>

        {/* Right Mockup Showcase Column (5 cols) */}
        <div className="w-full lg:col-span-5 relative z-10 perspective-1000">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full aspect-[4/3] max-w-[540px] mx-auto group"
          >
            
            {/* The Laptop Mockup */}
            <motion.div 
              whileHover={{ y: -4 }}
              animate={{ y: [0, -8, 0] }}
              transition={{ 
                y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                type: "spring", stiffness: 300, damping: 20 
              }}
              className="absolute right-0 top-6 w-[88%] rounded-lg bg-neutral-900 p-1.5 sm:p-2 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] border border-neutral-800"
            >
              <div className="relative bg-white rounded-sm sm:rounded overflow-hidden aspect-[16/10] flex flex-col">
                {/* Browser bar */}
                <div className="h-4 sm:h-6 bg-neutral-100 border-b border-neutral-200 flex items-center px-2 gap-1.5 shrink-0">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-400" />
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-400" />
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-400" />
                  <div className="mx-auto bg-white border border-neutral-200 h-2.5 sm:h-3.5 w-1/3 rounded-full" />
                </div>
                {/* Website Content (CSS Mockup) */}
                <div className="flex-1 bg-[#FBF9F6] relative overflow-hidden flex flex-col">
                  {/* Web Nav */}
                  <div className="flex justify-between items-center px-4 py-2 border-b border-[#C5A880]/20">
                    <span className="font-serif text-[8px] sm:text-[10px] font-bold text-[#8B263E]">A & D</span>
                    <div className="flex gap-2 sm:gap-3 text-[6px] sm:text-[7px] font-medium text-neutral-500 uppercase tracking-wider">
                      <span>Home</span>
                      <span>Story</span>
                      <span>Events</span>
                      <span>Gallery</span>
                    </div>
                  </div>
                  {/* Web Hero */}
                  <div className="flex-1 flex flex-col items-center justify-center relative p-4 text-center">
                    <div className="absolute inset-0 opacity-10 bg-neutral-100" />
                    <h2 className="relative z-10 font-serif text-xl sm:text-3xl text-neutral-900 mb-3">Aarav & Diya</h2>
                    
                    <div className="relative z-10 flex gap-3 sm:gap-4 text-[6px] sm:text-[8px] font-sans font-medium text-neutral-500 uppercase tracking-widest mb-6">
                      <span>Our Story</span>
                      <span>Events</span>
                      <span>Gallery</span>
                      <span>RSVP</span>
                    </div>

                    <span className="relative z-10 font-serif text-[8px] sm:text-[10px] text-neutral-600 mb-2">12 December 2026</span>
                    <span className="relative z-10 font-sans text-[6px] sm:text-[8px] uppercase tracking-[0.2em] text-[#8B263E] mb-4 font-bold">127 Days To Go</span>
                    
                    <div className="relative z-10 px-3 py-1.5 sm:px-4 sm:py-2 bg-neutral-900 text-white text-[6px] sm:text-[8px] font-bold uppercase tracking-widest rounded-full">
                      RSVP Now
                    </div>
                  </div>
                </div>
              </div>
              {/* Laptop Base */}
              <div className="h-2 sm:h-3 bg-neutral-800 rounded-b-xl mt-0.5 mx-[-2px] sm:mx-[-4px] relative flex justify-center">
                 <div className="w-12 h-1 bg-neutral-700 rounded-b-md" />
              </div>
            </motion.div>

            {/* The Phone Mockup */}
            <motion.div 
              whileHover={{ y: -6 }}
              animate={{ y: [0, -10, 0] }}
              transition={{ 
                y: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 },
                type: "spring", stiffness: 300, damping: 20 
              }}
              className="absolute left-[2%] bottom-[2%] w-[34%] rounded-[20px] sm:rounded-[32px] bg-neutral-900 p-1.5 sm:p-2 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] border border-neutral-700 z-20"
            >
              <div className="relative bg-[#FAF7F2] rounded-[16px] sm:rounded-[24px] overflow-hidden aspect-[9/19.5] flex flex-col shadow-inner">
                {/* iPhone Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-3 sm:h-4 bg-neutral-900 rounded-b-[10px] z-30" />
                
                {/* eInvite Content (CSS Mockup) */}
                <div className="flex-1 relative m-1.5 sm:m-2 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center p-3 text-center overflow-hidden bg-[#FDFBF7]">
                  
                  <div className="relative z-10 font-serif text-2xl sm:text-3xl text-[#8B263E] leading-none mb-2">Aarav</div>
                  <div className="relative z-10 font-serif text-sm sm:text-lg text-[#C5A880] mb-2">&</div>
                  <div className="relative z-10 font-serif text-2xl sm:text-3xl text-[#8B263E] leading-none mb-6">Diya</div>
                  
                  <div className="relative z-10 flex flex-col gap-1.5 text-[7px] sm:text-[9px] font-medium text-neutral-600 mb-5 tracking-widest uppercase">
                    <span>12 · 12 · 2026</span>
                    <span className="text-[6px] sm:text-[7px]">Hyderabad</span>
                  </div>
                  
                  <div className="relative z-10 w-full py-2 bg-[#8B263E] text-white text-[6px] sm:text-[8px] font-bold uppercase tracking-widest rounded-full">
                    RSVP Now
                  </div>
                </div>
              </div>
            </motion.div>

          </motion.div>
          
          {/* Real Product UI Badges - hidden on mobile to prevent blocking CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="hidden sm:flex absolute top-1/4 -right-4 sm:-right-6 bg-white py-1.5 px-3 rounded-md shadow-lg border border-neutral-100 items-center gap-1.5 z-30"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-700">Live Preview</span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="hidden sm:flex absolute bottom-1/4 -left-2 sm:-left-4 bg-white py-1.5 px-3 rounded-full shadow-lg border border-neutral-100 items-center gap-1.5 z-30"
          >
            <span className="text-[10px] font-bold text-neutral-800">127</span>
            <span className="text-[9px] font-semibold text-neutral-500">RSVPs</span>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
