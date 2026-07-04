"use client";

import React from "react";
import Link from "next/link";
import { Camera, Palette, Music, Sparkles, Utensils, Brush } from "lucide-react";

export function MobileQuickSearchChips() {
  const chips = [
    { name: "Photography", icon: <Camera className="w-4 h-4" />, href: "/vendors/photography" },
    { name: "Decor", icon: <Palette className="w-4 h-4" />, href: "/vendors/decor" },
    { name: "Makeup", icon: <Brush className="w-4 h-4" />, href: "/vendors/makeup" },
    { name: "Catering", icon: <Utensils className="w-4 h-4" />, href: "/vendors/catering" },
    { name: "Music", icon: <Music className="w-4 h-4" />, href: "/vendors/music" },
    { name: "Planning", icon: <Sparkles className="w-4 h-4" />, href: "/vendors/wedding-planning" },
  ];

  return (
    <div className="md:hidden w-full py-5 bg-white border-b border-neutral-border">
      <div 
        className="flex overflow-x-auto gap-3 px-4 scrollbar-none snap-x snap-mandatory touch-pan-x"
        style={{ scrollbarWidth: "none" }}
      >
        {chips.map((chip) => (
          <Link
            key={chip.name}
            href={chip.href}
            className="flex items-center gap-2 bg-neutral-cream border border-neutral-border px-4 py-2 min-h-[48px] rounded-full snap-start shrink-0 active:scale-[0.98] transition-transform shadow-sm"
          >
            <span className="text-primary opacity-80">{chip.icon}</span>
            <span className="text-xs font-bold text-neutral-charcoal">{chip.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
