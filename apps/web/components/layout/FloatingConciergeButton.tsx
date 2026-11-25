"use client";

import React from "react";
import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

export function FloatingConciergeButton() {
  const handleOpenConcierge = () => {
    document.getElementById("concierge-journey")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileTap={{ scale: 0.92 }}
      transition={{ delay: 1, type: "spring", stiffness: 200, damping: 20 }}
      onClick={handleOpenConcierge}
      className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] md:bottom-8 right-4 md:right-8 z-30 w-11 h-11 md:w-12 md:h-12 bg-[#8B263E] text-white rounded-full flex items-center justify-center shadow-[0_4px_16px_rgba(139,38,62,0.35)] border border-[#C5A880]/30 transition-transform hover:scale-105 cursor-pointer"
      aria-label="Contact Concierge"
    >
      <MessageCircle className="w-4 h-4 text-white" />
      <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
    </motion.button>
  );
}
