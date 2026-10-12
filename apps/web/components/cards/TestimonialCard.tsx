"use client";

import React from "react";
import { Star, MapPin } from "lucide-react";
import { Testimonial } from "@/mock-data/testimonials";

export default function TestimonialCard({ review }: { review: Testimonial }) {
  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-gray-100/60 shadow-[0_8px_30px_rgba(45,45,45,0.02)] hover:shadow-[0_20px_45px_rgba(139,38,62,0.07)] hover:border-[#C5A880]/20 transition-all duration-500 flex flex-col h-full">
      {/* Couple Banner Image */}
      <div className="relative h-60 w-full overflow-hidden bg-gray-150 shrink-0">
        <img
          src={review.imageUrl}
          alt={review.coupleNames}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
        {/* Dark overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent z-[1]" />
        
        {/* Location & Date Details */}
        <div className="absolute bottom-4 left-5 right-5 text-white z-10 text-left flex flex-col gap-0.5">
          <span className="text-[9px] font-black uppercase text-[#C5A880] tracking-widest">
            {review.date || "Real Wedding"}
          </span>
          <h4 className="font-serif text-base font-bold flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>{review.location || "Indian Wedding"}</span>
          </h4>
        </div>
      </div>

      {/* Quote & Couple Details */}
      <div className="p-6 text-left flex flex-col justify-between flex-grow gap-6 bg-gradient-to-b from-white to-[#FAF9F6]">
        
        {/* Quote Block */}
        <div className="relative flex-grow">
          {/* Decorative Drop Quote Mark */}
          <span className="absolute -top-6 -left-2 font-serif text-7xl text-[#C5A880]/15 select-none font-bold">
            “
          </span>
          
          <p className="text-[13px] sm:text-sm font-medium italic text-[#6D6D6D] leading-relaxed relative z-10 pl-3">
            {review.quote}
          </p>
        </div>

        {/* Couple & Review footer */}
        <div className="pt-4 border-t border-gray-200/50 flex items-center justify-between mt-auto">
          <span className="font-serif text-base font-black text-[#2D2D2D]">
            {review.coupleNames}
          </span>

          {/* Stars */}
          <div className="flex items-center gap-0.5 shrink-0">
            {[...Array(review.starsCount)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 text-[#C5A880] fill-[#C5A880] shrink-0" />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
