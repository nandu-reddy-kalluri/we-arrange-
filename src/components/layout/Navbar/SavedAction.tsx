"use client";

import React from "react";
import Link from "next/link";
import { Heart } from "lucide-react";

export function SavedAction({ useDarkText = false }: { useDarkText?: boolean }) {
  // In a real implementation, this would be fetched from a store or context
  const savedCount = 2; 

  const textClass = useDarkText ? "text-[#2D2D2D] hover:text-[#8B263E]" : "text-[#FAF9F6] drop-shadow-md hover:text-white hover:bg-white/10";
  const iconClass = useDarkText ? "text-neutral-400 group-hover:text-[#8B263E]" : "text-white/70 group-hover:text-white";

  return (
    <Link
      href="/saved"
      className={`relative flex items-center gap-2 px-3 py-2 rounded-full text-xs xl:text-sm font-semibold transition-all duration-300 group ${useDarkText ? "hover:bg-neutral-50" : ""} ${textClass}`}
    >
      <div className="relative flex items-center justify-center">
        <Heart className={`w-4 h-4 transition-colors duration-300 ${iconClass}`} />
        {savedCount > 0 && (
          <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-[#8B263E] rounded-full flex items-center justify-center border-2 border-white">
            <span className="text-[7px] font-black text-white">{savedCount}</span>
          </div>
        )}
      </div>
      <span className="hidden xl:inline">Saved</span>
    </Link>
  );
}
