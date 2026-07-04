"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Heart } from "lucide-react";

export default function CelebrateSection() {
  const handleCTAClick = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <section className="relative py-24 bg-[#1C0006] text-white overflow-hidden text-center">
      {/* Decorative vector background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(197,168,128,0.06),transparent_60%)] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-16 bg-gradient-to-b from-gray-200/20 to-accent-gold pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center gap-6">
        
        {/* Journey Step Node */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent-gold flex items-center justify-center border border-white/20 shadow-md mb-2">
          <Heart className="w-5 h-5 text-white" />
        </div>

        {/* Title */}
        <span className="font-sans text-[10px] sm:text-xs font-black uppercase text-accent-gold tracking-[0.3em] block">
          CELEBRATE • Let's Create Something Beautiful Together
        </span>

        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white max-w-2xl leading-tight">
          Let's Create Something Beautiful Together
        </h2>

        {/* Subtitle */}
        <p className="font-sans text-sm sm:text-base lg:text-lg text-neutral-cream/80 max-w-md font-medium">
          Tell us about your wedding. <br className="sm:hidden" />
          We'll take care of the research.
        </p>

        {/* Primary CTA */}
        <motion.button
          suppressHydrationWarning
          onClick={handleCTAClick}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="mt-4 px-10 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-white bg-gradient-to-r from-primary to-[#6E1C2F] border border-accent-gold/30 hover:border-accent-gold shadow-[0_8px_30px_rgba(139,38,62,0.4)] flex items-center justify-center gap-3 transition-all duration-300 cursor-pointer"
        >
          <span>Start Your Wedding Plan</span>
          <ArrowRight className="w-4 h-4 text-accent-gold" />
        </motion.button>

        {/* Serving area disclaimer */}
        <div className="mt-8 flex items-center gap-2 text-[10px] text-white/40 font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
          <span>Serving Hyderabad's Finest Celebrations</span>
        </div>

      </div>
    </section>
  );
}
