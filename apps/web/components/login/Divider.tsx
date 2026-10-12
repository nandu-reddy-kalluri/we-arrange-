"use client";

import React from "react";

interface DividerProps {
  text?: string;
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({
  text = "OR",
  className = "",
}) => {
  return (
    <div className={`relative flex items-center justify-center my-6 ${className}`}>
      {/* Left Gold Gradient Line */}
      <div className="flex-grow h-[1px] bg-gradient-to-r from-transparent via-[#C5A880]/40 to-[#C5A880]/70" />

      {/* Center Text Badge */}
      <span className="px-4 py-1 rounded-full text-[11px] font-serif tracking-widest text-[#8B263E] dark:text-[#C5A880] uppercase bg-[#FAF9F6]/80 dark:bg-zinc-900/80 border border-[#C5A880]/30 shadow-xs backdrop-blur-md">
        {text}
      </span>

      {/* Right Gold Gradient Line */}
      <div className="flex-grow h-[1px] bg-gradient-to-r from-[#C5A880]/70 via-[#C5A880]/40 to-transparent" />
    </div>
  );
};

export default Divider;
