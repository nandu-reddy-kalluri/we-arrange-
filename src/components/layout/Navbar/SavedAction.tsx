"use client";

import React from "react";
import Link from "next/link";
import { Heart } from "lucide-react";

export function SavedAction() {
  // In a real implementation, this would be fetched from a store or context
  const savedCount = 2; 

  return (
    <Link
      href="/saved"
      className="relative flex items-center gap-2 px-3 py-2 rounded-full text-xs xl:text-sm font-semibold text-[#2D2D2D] hover:text-[#8B263E] transition-all duration-300 group hover:bg-neutral-50"
    >
      <div className="relative flex items-center justify-center">
        <Heart className="w-4 h-4 text-neutral-400 group-hover:text-[#8B263E] transition-colors duration-300" />
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
