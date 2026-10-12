"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, X, Sparkles, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface InspirationHeroProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenChange?: (open: boolean) => void;
}

const INSPIRATION_RECOMMENDATIONS = [
  { title: "Floral Mandap Decor", category: "Decor", tag: "Trending" },
  { title: "Wedding Photography & Cinema", category: "Photography", tag: "Popular" },
  { title: "Pre-Wedding Shoot Ideas", category: "Photography", tag: "Ideas" },
  { title: "Bridal Lehengas & Couture", category: "Fashion", tag: "Trending" },
  { title: "Hyderabad Royal Palace Weddings", category: "Venues", tag: "Hyderabad" },
  { title: "Heritage Forts in Hyderabad", category: "Venues", tag: "Hyderabad" },
  { title: "Stage & Reception Decor", category: "Decor", tag: "Decor" },
  { title: "Destination Beach Weddings", category: "Themes", tag: "Destination" },
  { title: "Mehendi Lounge Setup", category: "Decor", tag: "Mehendi" },
  { title: "Minimalist Pastel Aesthetics", category: "Themes", tag: "Aesthetics" },
  { title: "Groom Sherwani & Royal Styling", category: "Fashion", tag: "Fashion" },
  { title: "Intimate Backyard Weddings", category: "Themes", tag: "Intimate" },
];

export function InspirationHero({ searchQuery, setSearchQuery, onOpenChange }: InspirationHeroProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  // Close dropdown on click outside or touch outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick, { passive: true });
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Smart letter-based search matching
  const filteredRecommendations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return INSPIRATION_RECOMMENDATIONS;
    return INSPIRATION_RECOMMENDATIONS.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.tag.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <section className="relative pt-24 pb-8 md:pt-40 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center flex flex-col items-center overflow-visible">
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

      {/* Premium Search Bar with Recommendations */}
      <motion.div
        ref={containerRef}
        className={`relative w-full max-w-xl mt-8 ${isOpen ? "z-[100]" : "z-30"}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="relative flex items-center bg-white backdrop-blur-md rounded-full px-6 py-3 border border-gray-200 shadow-[0_12px_30px_rgba(0,0,0,0.04)] focus-within:shadow-[0_12px_40px_rgba(200,161,101,0.15)] focus-within:border-[#C8A165] transition-all duration-300">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            id="inspiration-search-input"
            type="text"
            value={searchQuery}
            onFocus={() => setIsOpen(true)}
            onClick={() => setIsOpen(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
            }}
            placeholder="Search Ideas (e.g. photo, dec, hy)..."
            className="w-full pl-3 pr-2 py-3 bg-transparent text-[15px] text-neutral-800 placeholder-neutral-400 outline-none font-medium"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-xs text-neutral-400 hover:text-[#8B263E] font-bold px-2 py-1 mr-1 transition-colors"
              aria-label="Clear search input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            id="inspiration-search-button"
            type="button"
            onClick={() => setIsOpen(false)}
            className="bg-[#8B263E] hover:bg-[#6e1c2f] text-white text-xs font-bold uppercase tracking-widest px-6 py-2.5 rounded-full shrink-0 shadow-md hover:shadow-lg transition-all duration-300 active:scale-95"
          >
            Search
          </button>
        </div>

        {/* Search Recommendations Popover */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.97 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute left-0 right-0 top-full mt-2.5 bg-white rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.25)] border border-[#C5A880]/30 p-3 z-[1000] text-left max-w-full overflow-hidden"
            >
              <div className="px-3 py-1.5 border-b border-neutral-100 mb-1.5 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#C8A165] flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#C8A165]" />
                  {searchQuery.trim() ? "Matching Ideas" : "Curated Recommendations"}
                </span>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="text-[10px] text-neutral-400 hover:text-[#8B263E] font-semibold transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                {filteredRecommendations.map((item, idx) => (
                  <button
                    key={`${item.title}-${idx}`}
                    type="button"
                    onClick={() => {
                      setSearchQuery(item.title);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl font-medium text-neutral-800 hover:bg-[#FAF5ED] hover:text-[#8B263E] transition-all text-left group"
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="truncate font-semibold group-hover:text-[#8B263E] text-neutral-800">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-neutral-400">{item.category}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500 font-semibold group-hover:bg-[#C8A165]/20 group-hover:text-[#8B263E]">
                        {item.tag}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#C8A165] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}

                {filteredRecommendations.length === 0 && (
                  <div className="text-center py-6 px-3">
                    <p className="text-xs text-neutral-500 font-medium">
                      No matching inspiration found for &quot;{searchQuery}&quot;
                    </p>
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="mt-2 text-xs text-[#8B263E] font-bold hover:underline"
                    >
                      Show all recommendations
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
