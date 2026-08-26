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
      className="md:hidden fixed bottom-6 right-4 z-40 w-12 h-12 bg-[#8B263E] text-white rounded-full flex items-center justify-center shadow-[0_6px_20px_rgba(139,38,62,0.4)] border border-[#C5A880]/30 transition-transform cursor-pointer"
      aria-label="Contact Concierge"
    >
      <MessageCircle className="w-5 h-5 text-white" />
      <span className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
    </motion.button>
  );
}
