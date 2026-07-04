"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, X } from "lucide-react";
import { photography } from "@/lib/design/photography";
import Image from "next/image";

interface MobileExperienceProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileExperience({ isOpen, onClose }: MobileExperienceProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const sections = [
    { id: "venues", title: "Venues", subtitle: "Royal Palaces & Hotels", img: photography.palaces[0] },
    { id: "vendors", title: "Vendors", subtitle: "Curated Professionals", img: photography.decor[0] },
    { id: "services", title: "Services", subtitle: "Concierge Planning", img: photography.decor[1] },
    { id: "inspiration", title: "Inspiration", subtitle: "Sabyasachi Dreams", img: photography.editorial[0] },
  ];

  // Lock body scroll when open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed inset-0 z-50 bg-[#FBF9F6] overflow-y-auto flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#C5A880]/10 bg-[#FBF9F6] sticky top-0 z-10">
            <span className="font-serif text-2xl font-bold text-[#2D2D2D]">Explore</span>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-[#C5A880]/20 text-[#2D2D2D]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Large Touchable Cards */}
          <div className="p-6 flex flex-col gap-4 pb-24">
            {sections.map((section) => (
              <motion.div 
                key={section.id}
                onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#C5A880]/10"
              >
                <div className="relative h-40 w-full">
                  <img src={section.img} alt={section.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="absolute bottom-4 left-4">
                    <h3 className="font-serif text-2xl font-bold text-white">{section.title}</h3>
                    <p className="text-xs font-semibold text-white/80 uppercase tracking-widest">{section.subtitle}</p>
                  </div>
                </div>
                
                <AnimatePresence>
                  {expandedSection === section.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 py-6 bg-white flex flex-col gap-4"
                    >
                      <Link href={`/${section.id}`} onClick={onClose} className="flex items-center justify-between p-4 rounded-xl bg-[#F5F2EB] text-[#2D2D2D]">
                        <span className="font-bold text-sm">Explore {section.title}</span>
                        <ChevronRight className="w-4 h-4 text-[#C5A880]" />
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
