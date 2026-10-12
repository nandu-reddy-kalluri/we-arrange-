"use client";

import React from "react";
import { motion } from "framer-motion";
import { Heart, ShieldCheck, Sparkles } from "lucide-react";

export function WhyWeddingStudio() {
  return (
    <section className="py-8 md:py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center"
      >
        <span className="font-sans text-[10px] font-black uppercase text-[#C5A880] tracking-[0.25em] block mb-8">
          Why Wedding Studio
        </span>
        
        <h2 className="font-serif text-[40px] md:text-[56px] lg:text-[72px] text-neutral-900 leading-[1.1] mb-8">
          Your invite.<br className="md:hidden" /> Your website.<br />
          <span className="text-[#8B263E] italic">Your story.</span>
        </h2>
        
        <p className="text-neutral-600 text-lg md:text-xl font-medium tracking-wide">
          One beautiful place to create it all.
        </p>
      </motion.div>
    </section>
  );
}
