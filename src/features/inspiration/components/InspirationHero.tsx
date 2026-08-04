"use client";

import React from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";

interface InspirationHeroProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function InspirationHero({ searchQuery, setSearchQuery }: InspirationHeroProps) {
  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center flex flex-col items-center">
      {/* Eyebrow Label */}
      <div className="flex items-center gap-3 overflow-hidden justify-center mb-4">
        <motion.span
          className="block h-px bg-gradient-to-r from-[#C8A165] to-transparent origin-right"
          style={{ width: 24 }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
        />
        <motion.span
          className="font-sans text-[10px] sm:text-[11px] font-black uppercase text-[#C8A165] tracking-[0.3em]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
        >
          DISCOVER • Wedding Aesthetics
        </motion.span>
        <motion.span
          className="block h-px bg-gradient-to-l from-[#C8A165] to-transparent origin-left"
          style={{ width: 24 }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
        />
      </div>

      {/* Main Title */}
      <h1 className="font-serif text-[40px] md:text-[64px] text-neutral-900 leading-[1.05] tracking-tight font-light overflow-hidden">
        <motion.span
          className="block"
          initial={{ clipPath: "inset(0 0 100% 0)", opacity: 0, y: 30 }}
          animate={{ clipPath: "inset(0 0 0% 0)", opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          Wedding Inspiration
        </motion.span>
      </h1>

      {/* Subtitle */}
      <motion.p
        className="text-sm md:text-base text-neutral-500 font-medium max-w-2xl mx-auto leading-relaxed mt-4"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        Discover ideas, themes, venues, décor, fashion and planning guides for your perfect celebration.
      </motion.p>

      {/* Premium Search Bar */}
      <motion.div
        className="w-full max-w-xl mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="relative flex items-center bg-white backdrop-blur-md rounded-full px-6 py-3 border border-gray-200 shadow-[0_12px_30px_rgba(0,0,0,0.04)] focus-within:shadow-[0_12px_40px_rgba(200,161,101,0.15)] focus-within:border-[#C8A165] focus-within:-translate-y-1 transition-all duration-500">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            id="inspiration-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Ideas..."
            className="w-full pl-3 pr-2 py-3 bg-transparent text-[15px] text-neutral-800 placeholder-neutral-400 outline-none font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-neutral-400 hover:text-[#8B263E] font-bold px-2 py-1 mr-1"
            >
              Clear
            </button>
          )}
          <button
            id="inspiration-search-button"
            className="bg-gradient-to-tr from-[#C89B3C] to-[#E8C875] text-white text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-full shrink-0 shadow-md hover:shadow-lg transition-all duration-300"
          >
            Search
          </button>
        </div>
      </motion.div>
    </section>
  );
}
