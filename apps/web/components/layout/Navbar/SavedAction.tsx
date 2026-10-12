"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useSavedStore } from "@/store/useSavedStore";

export function SavedAction({ useDarkText = false }: { useDarkText?: boolean }) {
  const { savedVenueIds, savedVendorIds } = useSavedStore();
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const savedCount = isMounted ? savedVenueIds.length + savedVendorIds.length : 0;

  const textClass = useDarkText ? "text-[#2D2D2D] hover:text-[#8B263E]" : "text-[#FAF9F6] drop-shadow-md hover:text-white hover:bg-white/10";
  const iconClass = useDarkText ? "text-neutral-400 group-hover:text-[#8B263E]" : "text-white/70 group-hover:text-white";

  return (
    <Link
      href="/saved"
      className={`relative flex items-center gap-2 px-3 py-2 rounded-full text-xs xl:text-sm font-semibold transition-all duration-300 group ${useDarkText ? "hover:bg-neutral-50" : ""} ${textClass}`}
      title="Saved Items"
    >
      <div className="relative flex items-center justify-center">
        <Heart className={`w-4 h-4 transition-colors duration-300 ${savedCount > 0 ? "fill-[#8B263E] text-[#8B263E]" : iconClass}`} />
        {savedCount > 0 && (
          <div className="absolute -top-1.5 -right-1.5 min-w-[15px] h-[15px] px-0.5 bg-[#8B263E] rounded-full flex items-center justify-center border-2 border-white shadow-sm">
            <span className="text-[8px] font-black text-white leading-none">{savedCount}</span>
          </div>
        )}
      </div>
      <span className="hidden xl:inline">Saved</span>
    </Link>
  );
}
