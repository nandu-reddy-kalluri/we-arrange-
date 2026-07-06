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
      className="md:hidden fixed bottom-6 right-6 z-50 w-12 h-12 bg-neutral-charcoal rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-accent-gold/20"
      aria-label="Contact Concierge"
    >
      <MessageCircle className="w-5 h-5 text-accent-gold" />
      <span className="absolute 0 -right-0 w-3 h-3 bg-emerald-500 border-2 border-neutral-charcoal rounded-full" />
    </motion.button>
  );
}
