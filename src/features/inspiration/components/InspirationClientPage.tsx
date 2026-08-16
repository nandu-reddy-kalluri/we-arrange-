"use client";

import React, { useState, useRef, useMemo } from "react";
import { InspirationHero } from "./InspirationHero";
import { InspirationCard } from "./InspirationCard";
import { InspirationDetailModal } from "./InspirationDetailModal";
import { 
  InspirationItem,
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
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion";
import { Sparkles, Trash2 } from "lucide-react";
import { typography, spacing, layout } from "@/styles";



const CATEGORIES = [
  { id: "all", label: "All Inspirations", subtitle: "The Complete Collection", count: "842 Curated Concepts", bg: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80" },
  { id: "themes", label: "Wedding Themes", subtitle: "Define Your Aesthetic", count: "124 Curated Themes", bg: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80" },
  { id: "real-weddings", label: "Real Weddings", subtitle: "Authentic Celebrations", count: "312 Love Stories", bg: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80" },
  { id: "ideas", label: "Ideas", subtitle: "Creative Concepts", count: "156 Expert Tips", bg: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80" },
  { id: "decor", label: "Decor Inspiration", subtitle: "Visual Styling Details", count: "214 Design Ideas", bg: "https://images.unsplash.com/photo-1519225495810-7517c2965a7d?auto=format&fit=crop&q=80" },
  { id: "photography", label: "Photography", subtitle: "Capture The Moment", count: "189 Visual Memories", bg: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&q=80" },
  { id: "bridal-fashion", label: "Bridal Fashion", subtitle: "Elegant Attire", count: "205 Bridal Looks", bg: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80" },
  { id: "groom-fashion", label: "Groom Fashion", subtitle: "Dapper Menswear", count: "112 Groom Styles", bg: "https://images.unsplash.com/photo-1610652492500-ded49ceeb378?auto=format&fit=crop&q=80" },
  { id: "wedding-trends", label: "Wedding Trends", subtitle: "What's Popular Now", count: "48 Modern Trends", bg: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80" },
  { id: "editors-picks", label: "Editor's Picks", subtitle: "Curated Selections", count: "24 Top Choices", bg: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80" },
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
  const [selectedItem, setSelectedItem] = useState<InspirationItem | null>(null);
  
  // Physics & Interaction state for the Editorial Object
  const constraintsRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const lowercaseQuery = searchQuery.toLowerCase().trim();

  // Phase 3 React Optimization: Memoize heavy filtering to prevent re-renders on layout interactions
  const filteredSections = useMemo(() => {
    return SECTION_DATA.map(section => ({
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
  }, [lowercaseQuery, activeCategory]);

  const totalResults = useMemo(() => {
    return filteredSections.reduce((acc, curr) => acc + curr.filteredData.length, 0);
  }, [filteredSections]);

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
      <div className="relative z-10 border-b border-[#E8D8BC]/30 sticky top-[56px] md:top-[88px] pt-4 md:pt-8 pb-0 mb-4 md:mb-8">
        
        {/* Semi-transparent overlay to ensure text readability */}
        <div className="absolute inset-0 z-0 bg-[#FBF9F6]/85 backdrop-blur-md" />

        <div className={`${layout.maxWidth} px-0 relative z-10`}>
          
          <div className="text-center mb-6">
            <span className="text-[10px] font-black uppercase text-[#C8A165] tracking-[0.25em]">
              Browse Collections
            </span>
          </div>

          <div className="relative pb-6 overflow-hidden" ref={constraintsRef}>
            {/* Left Edge Fade */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#FBF9F6] to-transparent z-20 pointer-events-none" />
            
            <motion.div 
              drag="x" 
              dragConstraints={constraintsRef}
              dragElastic={0.1}
              dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
              className="flex items-center justify-start gap-2 sm:gap-4 px-6 sm:px-12 w-max cursor-grab active:cursor-grabbing relative z-10"
            >
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.id;
                
                return (
                  <motion.button
                    layout
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    onMouseMove={isActive ? handleMouseMove : undefined}
                    whileHover={isActive ? undefined : { scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    transition={
                      isActive 
                        ? { type: "spring", stiffness: 650, damping: 45, mass: 0.5 } 
                        : { type: "spring", stiffness: 650, damping: 45, mass: 0.5 }
                    }
                    className={`relative group flex items-center justify-center whitespace-nowrap outline-none transition-colors duration-300 ${
                      isActive 
                        ? "h-[60px] px-6 sm:px-8" 
                        : "h-12 px-4 text-neutral-400 hover:text-neutral-800"
                    }`}
                  >
                    {/* Active Capsule Background (The Shared Object) */}
                    {isActive && (
                      <motion.div
                        layoutId="activeCategoryCapsule"
                        className="absolute inset-0 z-0 overflow-hidden bg-neutral-900 shadow-[0_12px_24px_rgba(0,0,0,0.15)]"
                        style={{ borderRadius: 9999 }}
                        transition={{ type: "spring", stiffness: 650, damping: 45, mass: 0.5 }}
                      >
                        {/* Living Imagery: Cinematic Pan & Depth */}
                        <motion.div
                          key={`bg-${cat.id}`}
                          className="absolute inset-0 bg-cover bg-center"
                          initial={{ opacity: 0, scale: 1.15 }}
                          animate={{ opacity: 0.6, scale: 1, x: [-5, 0] }}
                          transition={{ 
                            opacity: { duration: 0.8, ease: "easeOut" },
                            scale: { duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" },
                            x: { duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" }
                          }}
                          style={{ backgroundImage: `url(${cat.bg})` }}
                        />
                        
                        {/* Responsive Material Light (Pillar 4) */}
                        <motion.div
                          className="absolute inset-0 z-10 pointer-events-none mix-blend-overlay opacity-50"
                          style={{
                            background: useMotionTemplate`
                              radial-gradient(
                                120px circle at ${mouseX}px ${mouseY}px,
                                rgba(255, 255, 255, 0.4),
                                transparent 80%
                              )
                            `,
                          }}
                        />
                      </motion.div>
                    )}

                    {/* Hover Indicator for Inactive Items */}
                    {!isActive && (
                      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#C8A165] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    )}

                    {/* Editorial Text Container */}
                    <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none pt-0.5">
                      <motion.span 
                        layout="position"
                        className={`text-[11px] uppercase tracking-[0.15em] transition-colors duration-300 ${
                          isActive ? "text-white font-bold" : "font-medium"
                        }`}
                      >
                        {cat.label}
                      </motion.span>
                      
                      {/* Editorial Storytelling Subtitle */}
                      <AnimatePresence>
                        {isActive && cat.subtitle && (
                          <motion.span
                            initial={{ opacity: 0, height: 0, y: 5 }}
                            animate={{ opacity: 0.9, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: 5 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="text-[9px] font-medium text-[#E8D8BC] uppercase tracking-widest mt-0.5 block"
                          >
                            {cat.subtitle}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>

            {/* Right Edge Fade */}
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#FBF9F6] to-transparent z-20 pointer-events-none" />
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
            <div className="flex flex-col gap-8 md:gap-24">
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
                    className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6"
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
                          <InspirationCard item={item} onClick={() => setSelectedItem(item)} />
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

      <InspirationDetailModal 
        item={selectedItem} 
        onClose={() => setSelectedItem(null)} 
      />
    </div>
  );
}
