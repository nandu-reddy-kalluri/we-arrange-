"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function StudioCTA() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-12">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="relative bg-neutral-900 rounded-[2.5rem] overflow-hidden text-center py-20 px-6 lg:px-12"
      >
        {/* Soft Background Gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[150%] bg-gradient-to-tr from-[#8B263E]/20 to-transparent blur-[120px] rounded-full transform -rotate-45" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[150%] bg-gradient-to-tl from-[#C5A880]/20 to-transparent blur-[120px] rounded-full transform rotate-45" />
          
          {/* Subtle noise texture */}
          <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
          <span className="font-sans text-[10px] font-black uppercase text-[#C5A880] tracking-[0.3em] block mb-6">
            Get Started
          </span>
          
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white leading-[1.1] mb-6">
            Your story deserves a <br className="hidden sm:block" />
            <span className="italic text-[#FBF9F6]">beautiful beginning.</span>
          </h2>
          
          <p className="text-neutral-400 text-base md:text-lg mb-10 max-w-lg mx-auto">
            Create an unforgettable digital experience for your wedding. Start with a premium template today.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link 
              href="#products"
              className="px-8 py-4 rounded-full text-sm font-bold text-neutral-900 bg-white hover:bg-[#FBF9F6] transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2 group w-full sm:w-auto"
            >
              Create Your Wedding Studio
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              href="#templates"
              className="px-8 py-4 rounded-full text-sm font-bold text-white bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-center w-full sm:w-auto"
            >
              Explore Templates
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
