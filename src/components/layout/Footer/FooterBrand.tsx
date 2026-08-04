"use client";

import React from "react";
import { motion } from "framer-motion";

export function FooterBrand() {
  return (
    <>
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
          className="relative flex flex-col items-center"
        >
          <span className="font-serif text-[32px] md:text-[40px] font-bold text-white tracking-tight leading-none drop-shadow-[0_0_20px_rgba(200,155,60,0.3)] block text-center">
            YouMarriage
          </span>
          <span className="font-sans text-[12px] md:text-[14px] font-black text-white/80 tracking-[0.5em] block text-center mt-2 uppercase">
            We Arrange
          </span>
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
