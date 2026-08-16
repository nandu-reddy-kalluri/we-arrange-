"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useReducedMotion } from "framer-motion";
import { MapPin, Users, IndianRupee, Home, Calendar, Search, Sun, SlidersHorizontal } from "lucide-react";

const searchChips = [
  { id: "location", label: "Location", icon: MapPin },
  { id: "guests", label: "Guests", icon: Users },
  { id: "budget", label: "Budget", icon: IndianRupee },
  { id: "venueType", label: "Venue Type", icon: Home },
  { id: "date", label: "Date", icon: Calendar },
  { id: "space", label: "Indoor / Outdoor", icon: Sun },
];

export function VenueHeroSearch() {
  const [activeChip, setActiveChip] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  const shouldReduceMotion = useReducedMotion();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 120);
  });

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveChip(null);
      }
    };
    if (activeChip) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeChip]);

  return (
    <>
      <div className="sticky top-24 z-40 mx-auto w-[90%] max-w-5xl h-[68px]">
        <AnimatePresence>
          {!isScrolled && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
              className="absolute inset-0 w-full h-full bg-white/80 backdrop-blur-xl border border-white/40 rounded-full flex items-center justify-between p-2 md:p-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-shadow duration-500"
            >
              <div className="flex items-center w-full justify-between">
                <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pl-2 md:pl-4">
                  {searchChips.map((chip, idx) => {
                    const Icon = chip.icon;
                    const isActive = activeChip === chip.id;
                    const isAdvanced = idx >= 3;
                    return (
                      <button
                        key={chip.id}
                        onClick={() => setActiveChip(isActive ? null : chip.id)}
                        className={`${isAdvanced ? "hidden md:flex" : "flex"} items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-full whitespace-nowrap transition-all duration-300 ${
                          isActive 
                            ? "bg-[#FAF7F2] shadow-sm ring-1 ring-[#E8D8BC]" 
                            : "hover:bg-[#FAF7F2]/50 text-neutral-600 hover:text-neutral-900"
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? "text-[#C8A165]" : "text-neutral-400"}`} />
                        <div className="flex flex-col items-start text-left">
                          <span className={`text-[11px] font-bold ${isActive ? "text-neutral-900" : "text-neutral-500"}`}>
                            {chip.label}
                          </span>
                          {isActive && (
                            <span className="text-[9px] text-neutral-400 font-medium">Add detail</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                  
                  {/* Mobile All Filters Button */}
                  <button
                    onClick={() => setActiveChip("all_filters")}
                    className="flex md:hidden items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 hover:bg-[#FAF7F2]/50 text-neutral-600"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-neutral-400" />
                    <span className="text-[11px] font-bold text-neutral-500">Filters</span>
                  </button>
                </div>

                <button className="flex-shrink-0 ml-2 bg-gradient-to-tr from-[#C89B3C] to-[#E8C875] text-white p-3 md:px-6 md:py-3 rounded-full flex items-center gap-2 shadow-[0_4px_15px_rgba(200,155,60,0.3)] hover:shadow-[0_8px_25px_rgba(200,155,60,0.5)] transition-all duration-300">
                  <Search className="w-5 h-5 md:w-4 md:h-4" />
                  <span className="hidden md:inline text-xs font-black uppercase tracking-widest">Explore</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Filters Modal */}
      <AnimatePresence>
        {activeChip === "all_filters" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setActiveChip(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full bg-white rounded-t-3xl p-6 flex flex-col gap-6 max-h-[85vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-serif font-bold text-neutral-900">All Filters</h3>
                <button onClick={() => setActiveChip(null)} className="text-neutral-400 hover:text-neutral-900">
                  Close
                </button>
              </div>
              
              <div className="flex flex-col gap-4">
                {searchChips.map((chip) => {
                  const Icon = chip.icon;
                  return (
                    <div key={chip.id} className="flex flex-col gap-2 border-b border-neutral-100 pb-4">
                      <div className="flex items-center gap-2 text-neutral-900 font-bold">
                        <Icon className="w-4 h-4 text-[#C8A165]" />
                        <span className="text-sm">{chip.label}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {/* Placeholder chips for selection */}
                        <span className="px-3 py-1 text-xs border border-neutral-200 rounded-full text-neutral-600">Any</span>
                        <span className="px-3 py-1 text-xs border border-[#C8A165] bg-[#FAF7F2] rounded-full text-neutral-900 font-medium">Selected Option</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-neutral-100 sticky bottom-0 bg-white pb-4">
                <button 
                  onClick={() => setActiveChip(null)}
                  className="flex-1 py-3 text-sm font-bold text-neutral-600 hover:text-neutral-900"
                >
                  Clear All
                </button>
                <button 
                  onClick={() => setActiveChip(null)}
                  className="flex-1 bg-[#8B263E] text-white py-3 rounded-xl text-sm font-bold hover:bg-[#6e1c2f] transition-colors shadow-md"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
