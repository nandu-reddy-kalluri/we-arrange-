"use client";

import React, { useState } from "react";
import Image from "next/image";
import { vendorCategories } from "@/mock-data/vendors";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";

interface CategoryGridProps {
  onSelectCategory: (slug: string) => void;
  selectedCategory: string;
}

export function CategoryGrid({ onSelectCategory, selectedCategory }: CategoryGridProps) {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  return (
    <section className="py-16 bg-[#FAF9F6] border-b border-neutral-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center mb-12">
          <span className="font-sans text-[10px] font-black uppercase text-[#C5A880] tracking-[0.25em] block mb-2">
            EXPLORE • Wedding Specialties
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#2D2D2D]">
            Browse Vendors by Category
          </h2>
          <div className="w-16 h-0.5 bg-[#C5A880] mx-auto mt-4" />
        </div>

        {/* Categories Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 max-w-5xl mx-auto"
        >
          {vendorCategories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <motion.div
                key={cat.id}
                variants={itemVariants}
                onClick={() => onSelectCategory(isSelected ? "" : cat.slug)}
                className={`group relative aspect-[4/5] rounded-xxl overflow-hidden border cursor-pointer shadow-sm hover:shadow-premium transition-all duration-500 bg-white ${
                  isSelected
                    ? "border-[#8B263E] ring-2 ring-[#8B263E]/20"
                    : "border-neutral-border/60 hover:border-[#C5A880]"
                }`}
              >
                {/* Image Wrapper */}
                <div className="relative w-full h-[60%] overflow-hidden bg-gray-50">
                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                  />
                  {/* Luxury Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Gold Ring border on hover */}
                  <div className="absolute inset-2 border border-white/20 rounded-xl opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 pointer-events-none" />
                </div>

                {/* Details */}
                <div className="p-4 flex flex-col justify-between h-[40%] bg-white group-hover:bg-neutral-cream/20 transition-colors duration-300">
                  <h3 className="font-serif text-sm font-bold text-neutral-charcoal leading-tight line-clamp-2 group-hover:text-[#8B263E] transition-colors duration-200">
                    {cat.name}
                  </h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] font-black tracking-widest text-[#C5A880] uppercase">
                      {cat.count} Partners
                    </span>
                    <Sparkles className="w-3 h-3 text-[#C5A880] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
