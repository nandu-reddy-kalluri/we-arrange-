"use client";

import React, { useState } from "react";
import { InspirationHero } from "./InspirationHero";
import { InspirationCard } from "./InspirationCard";
import { 
  weddingThemes, 
  decorInspirations,
  realWeddings,
  ideas,
  photography,
  bridalFashion,
  groomFashion,
  weddingTrends,
  editorsPicks
} from "@/mock-data/inspiration";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Trash2 } from "lucide-react";
import { typography, spacing, layout } from "@/styles";

import { FooterWaveTransition } from "@/components/layout/FooterWaveTransition";

const CATEGORIES = [
  { id: "all", label: "All Inspirations" },
  { id: "themes", label: "Wedding Themes" },
  { id: "real-weddings", label: "Real Weddings" },
  { id: "ideas", label: "Ideas" },
  { id: "decor", label: "Decor Inspiration" },
  { id: "photography", label: "Photography" },
  { id: "bridal-fashion", label: "Bridal Fashion" },
  { id: "groom-fashion", label: "Groom Fashion" },
  { id: "wedding-trends", label: "Wedding Trends" },
  { id: "editors-picks", label: "Editor's Picks" },
];

const SECTION_DATA = [
  { id: "themes", title: "Wedding Themes", eyebrow: "CURATED STYLE • Define Your Aesthetic", data: weddingThemes },
  { id: "real-weddings", title: "Real Weddings", eyebrow: "TRUE STORIES • Real Inspiration", data: realWeddings },
  { id: "ideas", title: "Ideas & Advice", eyebrow: "EXPERT TIPS • Creative Concepts", data: ideas },
  { id: "decor", title: "Decor Inspiration", eyebrow: "STYLING DETAILS • Visual Inspiration", data: decorInspirations },
  { id: "photography", title: "Photography", eyebrow: "CAPTURE THE MOMENT • Visual Memories", data: photography },
  { id: "bridal-fashion", title: "Bridal Fashion", eyebrow: "ELEGANT ATTIRE • Bride's Trousseau", data: bridalFashion },
  { id: "groom-fashion", title: "Groom Fashion", eyebrow: "DAPPER LOOKS • Groom's Style", data: groomFashion },
  { id: "wedding-trends", title: "Wedding Trends", eyebrow: "WHAT'S NEW • Latest Trends", data: weddingTrends },
  { id: "editors-picks", title: "Editor's Picks", eyebrow: "CURATED FOR YOU • Top Selections", data: editorsPicks },
];

export function InspirationClientPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const lowercaseQuery = searchQuery.toLowerCase().trim();

  // Filter sections based on search query and active category
  const filteredSections = SECTION_DATA.map(section => ({
    ...section,
    filteredData: section.data.filter(
      (item) =>
        item.title.toLowerCase().includes(lowercaseQuery) ||
        item.description.toLowerCase().includes(lowercaseQuery)
    )
  })).filter(section => {
    // If a specific category is selected, only show that section
    if (activeCategory !== "all" && section.id !== activeCategory) {
      return false;
    }
    // Only show sections that have results
    return section.filteredData.length > 0;
  });

  const totalResults = filteredSections.reduce((acc, curr) => acc + curr.filteredData.length, 0);

  return (
    <div className="min-h-screen bg-[#FBF9F6] pb-0 relative overflow-hidden">
      {/* Decorative background lights */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C8A165]/5 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[40%] left-0 w-[600px] h-[600px] bg-[#8B263E]/3 blur-[150px] rounded-full pointer-events-none z-0" />

      {/* Hero Section */}
      <div className="relative z-10">
        <InspirationHero searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      </div>

      {/* Category Navigation */}
      <div className="relative z-10 border-b border-[#E8D8BC]/30 bg-[#FBF9F6]/80 backdrop-blur-md sticky top-[72px] md:top-[88px] pt-4 pb-0 mb-8">
        <div className={`${layout.maxWidth} px-4 sm:px-6`}>
          <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide snap-x">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`snap-start whitespace-nowrap px-5 py-2.5 rounded-full text-[13px] font-bold transition-all duration-300 ${
                  activeCategory === cat.id
                    ? "bg-[#C8A165] text-white shadow-md shadow-[#C8A165]/20"
                    : "bg-white text-neutral-600 hover:bg-[#FAF7F2] hover:text-neutral-900 border border-[#E8D8BC]/50"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={`relative z-10 ${layout.maxWidth} ${spacing.container}`}>
        {/* Results Counter if searching */}
        {searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-[#FAF7F2] rounded-2xl border border-[#E8D8BC]/40 inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#C8A165]" />
            <span className="text-xs font-semibold text-neutral-700">
              Found {totalResults} match{totalResults !== 1 && "es"} for &quot;{searchQuery}&quot;
            </span>
            <button
              onClick={() => setSearchQuery("")}
              className="text-[10px] font-bold text-[#8B263E] hover:underline uppercase tracking-wider ml-4"
            >
              Reset Search
            </button>
          </motion.div>
        )}

        {/* Dynamic List Content with AnimatePresence */}
        <AnimatePresence mode="wait">
          {totalResults === 0 ? (
            <motion.div
              key="no-results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center text-center py-20 px-4"
            >
              <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4 border border-neutral-200">
                <Trash2 className="w-6 h-6 text-neutral-400" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-neutral-900 mb-2">
                No matching inspirations found
              </h3>
              <p className="text-neutral-500 text-sm max-w-sm mb-6 font-medium">
                We couldn&apos;t find any inspiration matching &quot;{searchQuery}&quot;. Try adjusting your keywords.
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#8B263E] hover:bg-[#6e1c2f] transition-all duration-200 shadow-sm"
              >
                Clear Search
              </button>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-16 md:gap-24">
              {filteredSections.map((section) => (
                <motion.section
                  key={section.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex flex-col mb-8 pb-4 border-b border-[#E8D8BC]/30">
                    <span className="font-sans text-[10px] font-black uppercase text-[#C8A165] tracking-[0.25em] block mb-2">
                      {section.eyebrow}
                    </span>
                    <h2 className={`${typography.sectionTitle} text-neutral-900`}>
                      {section.title}
                    </h2>
                  </div>

                  <motion.div
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 lg:gap-x-8 gap-y-10"
                  >
                    <AnimatePresence>
                      {section.filteredData.map((item, index) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            transition: { delay: index * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                          }}
                          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        >
                          <InspirationCard item={item} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                </motion.section>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      <FooterWaveTransition />
    </div>
  );
}
