"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Share2, MapPin, Palette } from "lucide-react";
import Image from "next/image";
import { InspirationItem } from "@/mock-data/inspiration";

interface InspirationDetailModalProps {
  item: InspirationItem | null;
  onClose: () => void;
}

export function InspirationDetailModal({ item, onClose }: InspirationDetailModalProps) {
  // Prevent body scroll and add Escape key listener when open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (item) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    }
    
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [item, onClose]);

  if (!item) return null;

  return (
    <AnimatePresence>
      {item && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            onClick={onClose}
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-5xl bg-white rounded-[24px] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white md:text-neutral-900 md:bg-white md:border-gray-200 hover:bg-neutral-100 transition-colors shadow-sm cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Image Section */}
            <div className="w-full md:w-[55%] relative h-[40vh] md:h-auto bg-neutral-100 shrink-0">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-[#8B263E] shadow-sm">
                  {item.category.replace("-", " ")}
                </span>
              </div>
            </div>

            {/* Right Details Section */}
            <div className="w-full md:w-[45%] p-6 md:p-10 flex flex-col overflow-y-auto bg-[#FBF9F6]">
              <div className="flex-grow">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-neutral-900 leading-tight mb-4">
                  {item.title}
                </h2>
                
                <p className="text-sm text-neutral-600 leading-relaxed mb-8">
                  {item.description}
                </p>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Theme</span>
                    <span className="text-sm font-semibold text-neutral-800 flex items-center gap-1.5">
                      <Palette className="w-4 h-4 text-[#C8A165]" />
                      Classic Elegance
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Location</span>
                    <span className="text-sm font-semibold text-neutral-800 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#C8A165]" />
                      Hyderabad
                    </span>
                  </div>
                </div>

                {/* Optional Tag List */}
                <div className="mb-8">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 block mb-3">Tags & Styles</span>
                  <div className="flex flex-wrap gap-2">
                    {["Luxury", "Floral Decor", "Mandap", "Pastel Shades", "Traditional"].map((tag) => (
                      <span key={tag} className="px-3 py-1.5 bg-white border border-[#C8A165]/30 rounded-full text-[11px] font-semibold text-[#8B263E]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-6 border-t border-[#E8D8BC]/50 flex gap-4 mt-auto">
                <button className="flex-1 bg-[#8B263E] text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#6e1c2f] transition-colors shadow-md cursor-pointer">
                  View Related Vendors
                </button>
                <button className="w-12 h-12 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-neutral-600 hover:text-[#8B263E] hover:border-[#8B263E] transition-colors cursor-pointer">
                  <Heart className="w-5 h-5" />
                </button>
                <button className="w-12 h-12 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-neutral-600 hover:text-[#8B263E] hover:border-[#8B263E] transition-colors cursor-pointer">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
