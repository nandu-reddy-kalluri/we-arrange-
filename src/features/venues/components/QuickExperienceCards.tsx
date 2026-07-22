"use client";

import React from "react";
import { motion } from "framer-motion";
import { Compass, BookHeart, Calculator, Sparkles } from "lucide-react";

const EXPERIENCES = [
  {
    id: "explore",
    title: "Explore Venues",
    description: "Discover curated luxury spaces",
    icon: Compass,
    gradient: "from-[#FDFBF7] to-[#F4EFE6]",
    borderColor: "border-[#E8D8BC]/60",
    iconColor: "text-[#C8A165]"
  },
  {
    id: "shortlist",
    title: "Wedding Shortlist",
    description: "Save & compare favorites",
    icon: BookHeart,
    gradient: "from-[#FDFBF7] to-[#FCEFEF]",
    borderColor: "border-[#EACCD2]/60",
    iconColor: "text-[#6F1D2C]"
  },
  {
    id: "quotations",
    title: "Get Best Quotations",
    description: "Submit your requirement",
    icon: Sparkles,
    gradient: "from-[#FDFBF7] to-[#F3F0F6]",
    borderColor: "border-[#D6CDE3]/60",
    iconColor: "text-[#4A3B69]"
  },
  {
    id: "budget",
    title: "Budget Planner",
    description: "Track your dream celebration",
    icon: Calculator,
    gradient: "from-[#FDFBF7] to-[#E9F3ED]",
    borderColor: "border-[#C5E1D1]/60",
    iconColor: "text-[#2D6A4F]"
  }
];

export function QuickExperienceCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto px-4 sm:px-6 w-full">
      {EXPERIENCES.map((exp, idx) => {
        const Icon = exp.icon;
        
        return (
          <motion.div
            key={exp.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -5, scale: 1.02 }}
            className={`relative group cursor-pointer overflow-hidden rounded-3xl bg-gradient-to-br ${exp.gradient} border ${exp.borderColor} p-6 sm:p-8 flex flex-col justify-between min-h-[220px] shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-all duration-500`}
          >
            {/* Soft Grain Overlay */}
            <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-[0.03] mix-blend-overlay z-0" />
            
            {/* Glow Effect */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/60 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700 pointer-events-none" />

            <div className="relative z-10">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-white/50">
                <Icon className={`w-5 h-5 ${exp.iconColor}`} />
              </div>
              
              <h3 className="font-serif text-[22px] font-bold text-neutral-900 leading-tight mb-2 group-hover:text-black transition-colors">
                {exp.title}
              </h3>
              <p className="text-xs font-semibold text-neutral-500">
                {exp.description}
              </p>
            </div>
            
            <div className="relative z-10 mt-6 flex justify-end">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300 shadow-sm border border-neutral-100">
                <svg className={`w-3.5 h-3.5 ${exp.iconColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
