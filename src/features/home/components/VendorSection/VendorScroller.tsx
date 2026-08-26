"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { VendorCategory } from "@/mock-data/vendors";
import { motion } from "framer-motion";
import { ChevronRight, CheckCircle2, Sparkles } from "lucide-react";

const CATEGORY_METRICS: Record<string, string> = {
  photography: "120+ Verified Photographers",
  decor: "80+ Luxury Designers",
  catering: "60+ Premium Caterers",
  makeup: "150+ Bridal Experts",
  "wedding-planning": "45+ Curated Planners",
  mehendi: "90+ Master Artists",
};

export function VendorScroller({ categories }: { categories: VendorCategory[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 100, damping: 20 } 
    }
  };

  return (
    <motion.div 
      ref={containerRef}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={containerVariants}
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-6 lg:gap-8 pb-6 justify-center items-start"
    >
      {categories.map((category) => {
        const countStr = CATEGORY_METRICS[category.slug] || "50+ Verified Partners";
        return (
          <motion.div key={category.id} variants={itemVariants} className="w-full flex justify-center">
            <Link
              href={`/vendors?category=${category.slug}`}
              className="flex flex-col items-center gap-3.5 group cursor-pointer w-full text-center focus:outline-none relative"
            >
              <div className="relative w-28 h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full flex items-center justify-center transition-transform duration-500 ease-out group-hover:-translate-y-1.5">
                
                {/* Outer Glow */}
                <div className="absolute inset-1 bg-[#C8A165]/20 rounded-full blur-md group-hover:bg-[#C8A165]/35 transition-colors duration-500 opacity-0 group-hover:opacity-100" />
                
                {/* Champagne Ring */}
                <div className="absolute inset-[-4px] rounded-full border border-[#E8C97A]/40 group-hover:border-[#8B263E] group-hover:scale-105 transition-all duration-500 ease-out pointer-events-none" />
                
                {/* Elegant Double Border */}
                <div className="w-full h-full rounded-full p-[3px] bg-gradient-to-tr from-white via-[#FAF7F2] to-[#E8C97A]/30 group-hover:from-[#E8C97A]/40 group-hover:to-[#8B263E] transition-all duration-500 shadow-sm group-hover:shadow-md flex items-center justify-center relative z-10">
                  
                  {/* Verified Badge */}
                  <div className="absolute top-0 right-0 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md z-20 border border-[#E8D8BC]/60 group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#8B263E]" />
                  </div>

                  <div className="w-full h-full rounded-full bg-white p-[2px] flex items-center justify-center">
                    <div className="w-full h-full rounded-full overflow-hidden bg-neutral-100 relative">
                      <Image
                        src={category.imageUrl}
                        alt={category.name}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 112px, 144px"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1 items-center relative z-10 w-full mt-1">
                <span className="font-serif text-base md:text-lg font-bold text-neutral-900 group-hover:text-[#8B263E] transition-colors duration-300 leading-snug">
                  {category.name}
                </span>
                
                <span className="text-[10px] md:text-[11px] font-bold text-neutral-500 uppercase tracking-wider group-hover:text-[#C8A165] transition-colors duration-300">
                  {countStr}
                </span>

                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#8B263E] opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300 mt-0.5">
                  Explore <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
