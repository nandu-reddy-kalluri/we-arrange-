"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Instagram, Facebook, Twitter, Youtube } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full bg-[#120004] overflow-hidden pt-6 pb-4 flex flex-col justify-between">
      
      {/* Huge Background Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-serif font-black text-[150px] md:text-[180px] leading-none text-white opacity-[0.03] pointer-events-none select-none z-0 whitespace-nowrap">
        YW
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full flex flex-col items-center h-full relative z-10">
        
        {/* TOP: Big Floating Logo + Spotlight */}
        <div className="relative flex flex-col items-center mb-2 group">
          {/* Slow moving golden spotlight behind logo */}
          <motion.div 
            className="absolute -inset-10 bg-[radial-gradient(circle,rgba(200,155,60,0.25)_0%,transparent_60%)] blur-2xl pointer-events-none"
            animate={{ x: ["-40%", "40%", "-40%"] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <span className="font-serif text-[32px] md:text-[40px] font-bold text-white tracking-tight leading-none drop-shadow-[0_0_20px_rgba(200,155,60,0.3)] block text-center">
              YouMarriage
            </span>
          </motion.div>
        </div>

        {/* CENTER: Elegant Sentence */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mb-4"
        >
          <span className="font-serif italic text-base md:text-lg text-[#C89B3C] text-center block">
            Your celebration begins with the right choices.
          </span>
        </motion.div>

        {/* Thin Champagne Divider */}
        <div className="w-full max-w-md h-[1px] bg-gradient-to-r from-transparent via-[#C89B3C]/30 to-transparent mb-4" />

        {/* BOTTOM: Navigation & Socials */}
        <div className="flex flex-col md:flex-row items-center justify-between w-full mt-auto gap-5 md:gap-0">
          
          {/* Left: Navigation */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3"
          >
            {["Venues", "Vendors", "Inspiration", "Contact"].map((link) => (
              <Link 
                key={link} 
                href="#" 
                className="text-[10px] md:text-[11px] uppercase tracking-[0.25em] font-black text-white/50 hover:text-white transition-colors duration-300 drop-shadow-[0_0_10px_rgba(255,255,255,0)] hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]"
              >
                {link}
              </Link>
            ))}
          </motion.div>

          {/* Center: Copyright (Desktop) */}
          <div className="hidden md:block">
            <span className="text-[9px] uppercase tracking-[0.3em] font-black text-white/20">
              © {currentYear} YouMarriageWeArrange
            </span>
          </div>

          {/* Right: Floating Glass Bubbles */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex items-center gap-3"
          >
            {[Instagram, Facebook, Twitter, Youtube].map((Icon, idx) => (
              <Link 
                key={idx} 
                href="#" 
                className="w-8 h-8 rounded-full bg-white/[0.04] backdrop-blur-2xl border border-white/10 flex items-center justify-center text-[#C89B3C]/70 shadow-[0_5px_15px_rgba(0,0,0,0.2)] hover:bg-[#C89B3C]/10 hover:text-[#C89B3C] hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(200,155,60,0.4)] hover:border-[#C89B3C]/60 transition-all duration-300 ease-out"
              >
                <Icon className="w-[14px] h-[14px]" />
              </Link>
            ))}
          </motion.div>

          {/* Center: Copyright (Mobile) */}
          <div className="block md:hidden mt-4">
            <span className="text-[8px] uppercase tracking-[0.3em] font-black text-white/20">
              © {currentYear} YW
            </span>
          </div>

        </div>
      </div>
    </footer>
  );
}
