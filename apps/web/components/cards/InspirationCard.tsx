"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";

interface InspirationCategory {
  title: string;
  slug: string;
  imageUrl: string;
  aspectMobile?: string;
  aspectDesktop?: string;
}

export default function InspirationCard({
  category,
}: {
  category: InspirationCategory;
}) {
  const [liked, setLiked] = useState(false);

  // Combine responsive aspects (Pinterest feel on desktop, compact masonry on mobile)
  const aspectClassMobile = category.aspectMobile || "aspect-[3/2]";
  const aspectClassDesktop = category.aspectDesktop || "md:aspect-[3/4]";
  const aspectClass = `${aspectClassMobile} ${aspectClassDesktop}`;

  return (
    <div className={`relative group w-full rounded-[20px] md:rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)] bg-gray-50 shrink-0 ${aspectClass}`}>
      {/* Image */}
      <img
        src={category.imageUrl}
        alt={category.title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        loading="lazy"
      />

      {/* Subtle black gradient overlay at bottom for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent md:from-black/90 md:via-black/35 md:opacity-95 z-[1] pointer-events-none" />

      {/* Content overlay: Title and Favourite Icon positioned together on mobile */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:px-4 md:bottom-4 flex items-center justify-between z-10">
        <Link href={`/inspiration/${category.slug}`} className="block flex-grow">
          <span className="font-serif text-base md:text-base font-bold text-white tracking-wide hover:underline cursor-pointer text-left md:text-center block md:inline-block w-full drop-shadow-md">
            {category.title}
          </span>
        </Link>
        <button
          onClick={(e) => {
            e.preventDefault();
            setLiked(!liked);
          }}
          suppressHydrationWarning={true}
          className="w-8 h-8 md:absolute md:top-3.5 md:right-3.5 md:w-8 md:h-8 rounded-full bg-white/20 md:bg-white/95 backdrop-blur-md flex items-center justify-center text-white md:text-gray-500 hover:bg-white/40 md:hover:text-[#8B263E] transition-all shadow-sm focus:outline-none shrink-0"
        >
          <Heart
            className={`w-4 h-4 md:w-3.5 md:h-3.5 transition-all ${
              liked ? "fill-[#8B263E] text-[#8B263E] md:fill-[#8B263E] md:text-[#8B263E]" : "text-white md:text-gray-600"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
