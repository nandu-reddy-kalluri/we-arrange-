"use client";

import React from "react";
import { motion } from "framer-motion";

export function FooterBrand() {
  return (
    <>
      {/* TOP: Big Floating Text + Spotlight */}
      <div className="relative flex flex-col items-center mb-2 group">
        {/* Slow moving golden spotlight behind logo (Desktop only) */}
        <motion.div 
          className="hidden sm:block absolute -inset-10 bg-[radial-gradient(circle,rgba(200,155,60,0.25)_0%,transparent_60%)] blur-2xl pointer-events-none"
          animate={{ x: ["-40%", "40%", "-40%"] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative flex flex-col items-center text-center"
        >
          {/* Brand Text */}
          <div className="flex flex-col leading-none">
            <span className="font-serif text-3xl md:text-[40px] font-bold tracking-tight text-[#F0D28D] leading-none drop-shadow-[0_0_20px_rgba(240,210,141,0.3)]">
              YOU MARRIAGE
            </span>
            <span className="font-sans text-[11px] md:text-[14px] font-black text-[#8B263E] tracking-[0.4em] md:tracking-[0.5em] uppercase mt-2">
              WE ARRANGE
            </span>
          </div>
        </motion.div>
      </div>

      {/* CENTER: Elegant Sentence */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.2 }}
        className="mb-4 mt-2"
      >
        <span className="font-serif italic text-base md:text-lg text-[#C89B3C] text-center block">
          Your celebration begins with the right choices.
        </span>
      </motion.div>
    </>
  );
}
