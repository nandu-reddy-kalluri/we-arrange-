"use client";

import React from "react";
import { motion } from "framer-motion";

const STEPS = [
  {
    number: "01",
    title: "Choose a Design",
    description: "Browse our curated collection of premium templates. Find the one that perfectly matches your wedding theme and personal style.",
  },
  {
    number: "02",
    title: "Personalize Everything",
    description: "Add your photos, event details, and love story. Customize colors and typography to make the design truly yours.",
  },
  {
    number: "03",
    title: "Share & Celebrate",
    description: "Send your eInvites instantly via WhatsApp or email, and share your beautiful website link with all your guests.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-8 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-white rounded-3xl my-6 md:my-12 border border-neutral-100 shadow-sm">
      <div className="text-center mb-16">
        <span className="font-sans text-[10px] font-black uppercase text-[#C5A880] tracking-[0.25em] block mb-3">
          The Process
        </span>
        <h2 className="font-serif text-3xl md:text-5xl text-neutral-900">
          How It Works
        </h2>
      </div>

      <div className="flex flex-col md:grid md:grid-cols-3 gap-10 md:gap-12 relative max-w-sm md:max-w-none mx-auto">
        {/* Connecting Line (Desktop) */}
        <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-neutral-200 to-transparent z-0" />
        
        {/* Connecting Line (Mobile) */}
        <div className="md:hidden absolute top-12 bottom-12 left-[31px] w-[2px] bg-neutral-100 z-0" />
        
        {STEPS.map((step, idx) => (
          <motion.div 
            key={step.number}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: idx * 0.2 }}
            className="relative z-10 flex flex-row md:flex-col items-start md:items-center text-left md:text-center group gap-6 md:gap-0"
          >
            <div className="w-16 h-16 md:w-24 md:h-24 shrink-0 rounded-full bg-white border border-neutral-100 shadow-sm flex items-center justify-center md:mb-6 relative overflow-hidden group-hover:border-[#C5A880]/30 transition-colors duration-500">
              <div className="absolute inset-0 bg-[#FBF9F6] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative z-10 font-serif text-2xl md:text-3xl text-[#C5A880] italic">{step.number}</span>
            </div>
            
            <div className="pt-2 md:pt-0">
              <h3 className="font-serif text-xl text-neutral-900 mb-2 md:mb-3">{step.title}</h3>
              <p className="text-neutral-600 text-sm leading-relaxed max-w-xs md:mx-auto">
                {step.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
