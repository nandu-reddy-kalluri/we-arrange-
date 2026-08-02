"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  borderGold?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = "",
  glow = true,
  borderGold = true,
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1], // Custom smooth luxury spring curve
      }}
      className={`
        relative rounded-3xl backdrop-blur-xl
        bg-white/80 dark:bg-[#1A1819]/80
        p-8 sm:p-10 md:p-12
        transition-all duration-500
        ${
          glow
            ? "shadow-[0_25px_60px_-15px_rgba(139,38,62,0.14),0_0_40px_rgba(197,168,128,0.12)]"
            : "shadow-2xl"
        }
        ${
          borderGold
            ? "border border-[#C5A880]/35 hover:border-[#C5A880]/60"
            : "border border-white/40"
        }
        group overflow-hidden
        ${className}
      `}
      {...props}
    >
      {/* Soft Ambient Light Gradient Reflection */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-64 w-64 rounded-full bg-gradient-to-br from-[#C5A880]/20 via-[#8B263E]/10 to-transparent blur-3xl opacity-70 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-gradient-to-tl from-[#8B263E]/15 via-[#C5A880]/15 to-transparent blur-3xl opacity-70 group-hover:opacity-100 transition-opacity duration-700" />

      {/* Subtle Top Gold Highlight Line */}
      <div className="pointer-events-none absolute top-0 left-12 right-12 h-[1px] bg-gradient-to-r from-transparent via-[#C5A880]/60 to-transparent" />

      {/* Card Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};

export default GlassCard;
