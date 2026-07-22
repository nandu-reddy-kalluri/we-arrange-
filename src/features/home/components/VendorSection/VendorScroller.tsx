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
      className="flex overflow-x-auto md:grid md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-4 lg:gap-6 pb-12 md:pb-6 scrollbar-none snap-x snap-mandatory touch-pan-x justify-start md:justify-items-center"
      style={{ scrollbarWidth: "none" }}
    >
      {categories.map((category) => {
        const countStr = CATEGORY_METRICS[category.slug] || "50+ Verified Partners";
        return (
          <motion.div key={category.id} variants={itemVariants} className="shrink-0 snap-start">
            <Link
              href={`/vendors?category=${category.slug}`}
              className="flex flex-col items-center gap-4 group cursor-pointer w-[120px] md:w-full text-center focus:outline-none relative"
            >
              <div className="relative w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full flex items-center justify-center transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-2">
                
                {/* Outer Glow / Shadow */}
                <div className="absolute inset-2 bg-[#C8A165]/30 rounded-full blur-[20px] group-hover:bg-[#C8A165]/40 transition-colors duration-500 opacity-0 group-hover:opacity-100" />
                
                {/* Champagne Ring */}
                <div className="absolute inset-[-4px] rounded-full border border-[#E8C97A]/40 group-hover:border-[#C8A165] group-hover:scale-[1.03] transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none" />
                
                {/* Elegant Double Border */}
                <div className="w-full h-full rounded-full p-[3px] bg-gradient-to-tr from-transparent via-[#FAF7F2] to-[#E8C97A]/20 group-hover:from-[#E8C97A]/40 group-hover:to-[#C8A165] transition-all duration-700 shadow-[0_4px_15px_rgba(0,0,0,0.05)] group-hover:shadow-[0_12px_30px_rgba(200,161,101,0.2)] flex items-center justify-center relative z-10">
                  
                  {/* Verified Badge */}
                  <div className="absolute -top-0 -right-0 md:-top-1 md:-right-1 w-6 h-6 md:w-7 md:h-7 bg-white rounded-full flex items-center justify-center shadow-md z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-75 group-hover:scale-100">
                    <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#C8A165] fill-[#C8A165]/10" />
                  </div>

                  <div className="w-full h-full rounded-full bg-white p-[2px] flex items-center justify-center">
                    <div className="w-full h-full rounded-full overflow-hidden bg-neutral-cream relative">
                      <Image
                        src={category.imageUrl}
                        alt={category.name}
                        fill
                        unoptimized
                        sizes="(max-width: 1024px) 112px, 128px"
                        className="object-cover transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.08]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#6F1D2C]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1 items-center relative z-10 w-full mt-1">
                <span className="font-serif text-[15px] md:text-lg font-bold text-neutral-900 group-hover:text-[#6F1D2C] transition-colors duration-300 flex items-center justify-center gap-1 w-full relative">
                  {category.name}
                  <Sparkles className="w-2.5 h-2.5 text-[#C8A165] opacity-0 group-hover:opacity-100 transition-opacity duration-500 absolute -right-4 top-1" />
                </span>
                
                <span className="text-[9px] md:text-[10px] font-black text-neutral-500 uppercase tracking-widest group-hover:text-[#C8A165] transition-colors duration-300">
                  {countStr}
                </span>

                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#C8A165] opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 absolute -bottom-6">
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
