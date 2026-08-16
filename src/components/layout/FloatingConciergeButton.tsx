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
      whileTap={{ scale: 0.9 }}
      transition={{ delay: 1, type: "spring", stiffness: 200, damping: 20 }}
      onClick={handleOpenConcierge}
      className="md:hidden fixed bottom-[env(safe-area-inset-bottom,16px)] right-4 z-50 w-11 h-11 bg-neutral-charcoal rounded-full flex items-center justify-center shadow-[0_4px_16px_rgb(0,0,0,0.15)] border border-accent-gold/20 mb-4"
      aria-label="Contact Concierge"
    >
      <MessageCircle className="w-5 h-5 text-accent-gold" />
      <span className="absolute 0 -right-0 w-3 h-3 bg-emerald-500 border-2 border-neutral-charcoal rounded-full" />
    </motion.button>
  );
}
