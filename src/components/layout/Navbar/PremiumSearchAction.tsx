"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Search, MapPin, Users, IndianRupee, Home, Calendar, Sun, X } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { createPortal } from "react-dom";

const searchChips = [
  { id: "location", label: "Location", icon: MapPin },
  { id: "guests", label: "Guests", icon: Users },
  { id: "budget", label: "Budget", icon: IndianRupee },
  { id: "venueType", label: "Venue Type", icon: Home },
  { id: "date", label: "Date", icon: Calendar },
  { id: "space", label: "Indoor / Outdoor", icon: Sun },
];

export function PremiumSearchAction({ onMenuClose, useDarkText = false }: { onMenuClose: () => void, useDarkText?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeChip, setActiveChip] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
    setIsExpanded(false);
  }, [pathname]);

  const handleOpenSearch = () => {
    onMenuClose();
    setIsExpanded(true);
  };

  const handleSearch = () => {
    setIsExpanded(false);
    router.push("/venues");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", stiffness: 400, damping: 30 }
    }
  };

  const textClass = useDarkText ? "text-[#2D2D2D] hover:text-[#8B263E]" : "text-[#FAF9F6] drop-shadow-md hover:text-white hover:bg-white/10";
  const iconClass = useDarkText ? "text-black/40 group-hover:text-[#C5A880]" : "text-white/70 group-hover:text-white";

  return (
    <>
      <div className="relative z-[60] flex items-center">
        <motion.button
          onClick={handleOpenSearch}
          onMouseEnter={onMenuClose}
          className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-xs xl:text-sm font-semibold transition-all duration-300 group hover:shadow-sm ${useDarkText ? "hover:bg-black/5" : ""} ${textClass}`}
        >
          <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 mix-blend-overlay transition-opacity duration-300 pointer-events-none" />
          <Search className={`w-4 h-4 transition-colors duration-300 ${iconClass}`} />
          <span>Search</span>
          <span className="absolute bottom-1 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-[#C5A880]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </motion.button>
      </div>

      {mounted && createPortal(
        <AnimatePresence>
          {isExpanded && (
            <div className="fixed inset-0 z-[100] flex items-start justify-center pt-32 px-4 pointer-events-auto">
              {/* Darker background blur to hide underlying UI */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={() => setIsExpanded(false)}
              />

              {/* Premium floating canvas - SOLID WHITE to avoid messy bleed-through */}
              <motion.div
                className="relative w-full max-w-4xl bg-white shadow-[0_24px_80px_rgba(0,0,0,0.15)] rounded-[32px] p-8 md:p-12 flex flex-col"
              >
                <button
                  onClick={() => setIsExpanded(false)}
                  className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 transition-colors text-black/40 hover:text-black"
                >
                  <X className="w-5 h-5" />
                </button>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="mb-10 text-center"
                >
                  <div className="flex justify-center mb-6">
                    <svg viewBox="0 0 24 24" className="w-10 h-10 text-[#C5A880] fill-current opacity-20">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                    </svg>
                  </div>
                  <h2 className="font-serif text-3xl md:text-4xl font-bold text-black mb-2 tracking-tight">Design Your Celebration</h2>
                  <p className="text-black/60 font-medium">Refine your search to discover spaces that match your vision.</p>
                </motion.div>

                {/* Sequential reveal of search options */}
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10"
                >
                  {searchChips.map(chip => (
                    <motion.button
                      key={chip.id}
                      variants={itemVariants}
                      onClick={() => setActiveChip(chip.id === activeChip ? null : chip.id)}
                      className={`group flex items-center gap-4 p-4 rounded-2xl bg-white/60 hover:bg-[#FAF7F2] border transition-all text-left shadow-sm hover:shadow-md ${activeChip === chip.id ? "border-[#C5A880] ring-1 ring-[#C5A880]/20" : "border-black/5 hover:border-[#E8D8BC]"}`}
                    >
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300">
                        <chip.icon className={`w-5 h-5 ${activeChip === chip.id ? "text-[#C5A880]" : "text-black/40 group-hover:text-[#C5A880]"}`} />
                      </div>
                      <div>
                        <span className="block text-sm font-bold text-black">{chip.label}</span>
                        <span className="block text-xs text-black/60 font-medium mt-0.5">Any</span>
                      </div>
                    </motion.button>
                  ))}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex justify-center"
                >
                  <button
                    onClick={handleSearch}
                    className="bg-black text-white px-12 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-black/80 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    Explore Venues
                  </button>
                </motion.div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
