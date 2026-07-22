"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useReducedMotion } from "framer-motion";
import { MapPin, Users, IndianRupee, Home, Calendar, Search, Sun } from "lucide-react";

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

  return (
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
                {searchChips.map((chip) => {
                  const Icon = chip.icon;
                  const isActive = activeChip === chip.id;
                  return (
                    <button
                      key={chip.id}
                      onClick={() => setActiveChip(isActive ? null : chip.id)}
                      className={`flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-full whitespace-nowrap transition-all duration-300 ${
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
  );
}
