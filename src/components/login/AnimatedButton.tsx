"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";

interface AnimatedButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "gold";
  isLoading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  variant = "primary",
  isLoading = false,
  icon,
  fullWidth = true,
  className = "",
  disabled,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return `
          bg-gradient-to-r from-[#8B263E] via-[#A8324E] to-[#8B263E]
          text-[#FFFFFF] shadow-[0_10px_25px_-5px_rgba(139,38,62,0.4)]
          border border-[#C5A880]/40 hover:border-[#C5A880]
          hover:shadow-[0_15px_35px_-5px_rgba(139,38,62,0.5)]
        `;
      case "gold":
        return `
          bg-gradient-to-r from-[#C5A880] via-[#E6D4B8] to-[#C5A880]
          text-[#2D2D2D] font-semibold shadow-[0_10px_25px_-5px_rgba(197,168,128,0.4)]
          border border-[#9E8158]/30 hover:border-[#9E8158]
        `;
      case "secondary":
        return `
          bg-white/80 dark:bg-zinc-900/80 text-[#2D2D2D] dark:text-[#FAF9F6]
          border border-[#C5A880]/40 hover:bg-[#8B263E]/5 dark:hover:bg-[#C5A880]/10
          shadow-sm
        `;
      case "outline":
        return `
          bg-transparent text-[#8B263E] dark:text-[#C5A880]
          border border-[#8B263E]/40 dark:border-[#C5A880]/40
          hover:bg-[#8B263E]/10 dark:hover:bg-[#C5A880]/10
        `;
      default:
        return "";
    }
  };

  return (
    <motion.button
      whileHover={{ y: -2, scale: 1.005 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      disabled={isLoading || disabled}
      className={`
        relative inline-flex items-center justify-center gap-2.5
        rounded-2xl px-6 py-3.5 text-sm font-medium tracking-wide
        transition-all duration-300 select-none overflow-hidden group
        ${fullWidth ? "w-full" : "w-auto"}
        ${isLoading || disabled ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}
        ${getVariantStyles()}
        ${className}
      `}
      {...props}
    >
      {/* Light Shimmer Effect Sweep */}
      <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Button Icon or Loading Spinner */}
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : icon ? (
        <span className="transition-transform duration-200 group-hover:scale-110">
          {icon}
        </span>
      ) : null}

      {/* Children Text */}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};

export default AnimatedButton;
