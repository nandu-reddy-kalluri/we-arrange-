"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Eye, Wand2 } from "lucide-react";

type TemplateType = "einvites" | "websites";

const EINVITE_TEMPLATES = [
  { id: "e1", name: "Royal Heritage", category: "Traditional", isNew: true, image: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80" },
  { id: "e2", name: "Minimalist Love", category: "Modern", isNew: false, image: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80" },
  { id: "e3", name: "Garden Romance", category: "Floral", isNew: false, image: "https://images.unsplash.com/photo-1519225495810-7517c2965a7d?auto=format&fit=crop&q=80" },
  { id: "e4", name: "Contemporary Elegance", category: "Luxury", isNew: true, image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80" },
];

const WEBSITE_TEMPLATES = [
  { id: "w1", name: "The Editorial", category: "Modern", isNew: true, image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80" },
  { id: "w2", name: "Classic Story", category: "Traditional", isNew: false, image: "https://images.unsplash.com/photo-1610652492500-ded49ceeb378?auto=format&fit=crop&q=80" },
  { id: "w3", name: "Botanical Dreams", category: "Floral", isNew: false, image: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&q=80" },
  { id: "w4", name: "Golden Hour", category: "Luxury", isNew: false, image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80" },
];

const VIBES = [
  { id: "All", name: "All", desc: "View all styles", image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80" },
  { id: "Minimal", name: "Minimal", desc: "Editorial · Clean", image: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80" },
  { id: "Royal", name: "Royal", desc: "Regal · Grand", image: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80" },
  { id: "Garden", name: "Garden", desc: "Floral · Romantic", image: "https://images.unsplash.com/photo-1519225495810-7517c2965a7d?auto=format&fit=crop&q=80" },
  { id: "Modern", name: "Modern", desc: "Bold · Contemporary", image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80" },
  { id: "Indian", name: "Indian", desc: "Cultural · Timeless", image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80" },
  { id: "Fusion", name: "Fusion", desc: "Personal · Unexpected", image: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&q=80" },
];

export function PopularTemplates() {
  const [activeTab, setActiveTab] = useState<TemplateType>("einvites");
  const [activeVibe, setActiveVibe] = useState<string>("All");

  const allTemplates = activeTab === "einvites" ? EINVITE_TEMPLATES : WEBSITE_TEMPLATES;
  
  // Filter templates based on vibe
  const templates = activeVibe === "All" 
    ? allTemplates 
    : allTemplates.filter(t => t.category === activeVibe || (activeVibe === 'Garden' && t.category === 'Floral') || (activeVibe === 'Royal' && t.category === 'Traditional') || (activeVibe === 'Minimal' && t.category === 'Modern') || (activeVibe === 'Modern' && t.category === 'Luxury'));
    
  const viewAllRoute = `/wedding-studio/${activeTab}/templates`;

  return (
    <section id="templates" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <span className="font-sans text-[10px] font-black uppercase text-[#C5A880] tracking-[0.25em] block mb-3">
            Your Vibe. Your Invite.
          </span>
          <h2 className="font-serif text-3xl md:text-5xl text-neutral-900 leading-tight">
            Find a style that <br className="hidden md:block" />feels like you.
          </h2>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-white p-1.5 rounded-full border border-neutral-200 shadow-sm self-start md:self-auto">
          <button
            onClick={() => setActiveTab("einvites")}
            className={`relative px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${activeTab === "einvites" ? "text-white" : "text-neutral-500 hover:text-neutral-900"}`}
          >
            {activeTab === "einvites" && (
              <motion.div layoutId="templateTabBg" className="absolute inset-0 bg-neutral-900 rounded-full" />
            )}
            <span className="relative z-10">eInvites</span>
          </button>
          <button
            onClick={() => setActiveTab("websites")}
            className={`relative px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${activeTab === "websites" ? "text-white" : "text-neutral-500 hover:text-neutral-900"}`}
          >
            {activeTab === "websites" && (
              <motion.div layoutId="templateTabBg" className="absolute inset-0 bg-neutral-900 rounded-full" />
            )}
            <span className="relative z-10">Websites</span>
          </button>
        </div>
      </div>

      {/* Vibe Horizontal Swipe Selector */}
      <div className="relative mb-12 -mx-4 sm:mx-0 px-4 sm:px-0">
        <div 
          className="flex overflow-x-auto gap-3 md:gap-4 pb-6 snap-x snap-mandatory hide-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {VIBES.map((vibe) => (
            <button
              key={vibe.id}
              onClick={() => setActiveVibe(vibe.id)}
              className={`relative group shrink-0 snap-start rounded-2xl overflow-hidden transition-all duration-300 text-left ${activeVibe === vibe.id ? 'ring-2 ring-[#8B263E] ring-offset-2' : 'hover:opacity-80'}`}
              style={{ width: '160px', height: '90px' }}
            >
              <img src={vibe.image} alt={vibe.name} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
              <div className="absolute inset-0 p-3 flex flex-col justify-end">
                <span className="text-white font-serif text-lg leading-tight font-medium drop-shadow-md">{vibe.name}</span>
                {vibe.id !== 'All' && <span className="text-white/80 font-sans text-[8px] uppercase tracking-widest font-bold drop-shadow-md">{vibe.desc}</span>}
              </div>
            </button>
          ))}
        </div>
        {/* Mobile Gradient Edge */}
        <div className="absolute top-0 right-0 bottom-6 w-12 bg-gradient-to-l from-[#FBF7F1] to-transparent pointer-events-none md:hidden z-10" />
      </div>

      {/* Gallery Grid */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 pb-8 md:pb-0 snap-x snap-mandatory md:snap-none hide-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {templates.length === 0 ? (
              <div className="col-span-full py-12 text-center text-neutral-500 font-medium">
                No templates found for this vibe. More coming soon!
              </div>
            ) : templates.map((template, idx) => (
              <motion.div 
                key={template.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group relative w-[280px] md:w-auto shrink-0 snap-start bg-white rounded-2xl overflow-hidden border border-neutral-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 flex flex-col"
              >
                {/* Image Area with "Studio Preview" overlay */}
                <div className="relative aspect-[4/5] bg-neutral-100 overflow-hidden">
                  <img src={template.image} alt={template.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                  
                  {/* Badges */}
                  {template.isNew && (
                    <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm text-[#8B263E] text-[9px] font-black uppercase tracking-widest rounded shadow-sm z-10">
                      New
                    </div>
                  )}

                  {/* Desktop Hover Overlay (Studio Preview) */}
                  <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex flex-col items-center justify-center gap-3 z-20">
                    <button className="w-3/4 py-3 bg-white text-neutral-900 text-xs font-bold uppercase tracking-widest rounded-full hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                    <Link href={viewAllRoute} className="w-3/4 py-3 bg-[#8B263E] text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-[#6e1c2f] transition-colors flex items-center justify-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75 shadow-lg">
                      <Wand2 className="w-4 h-4" />
                      Use Template
                    </Link>
                  </div>
                </div>

                {/* Info Area */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-serif text-lg text-neutral-900 font-medium">{template.name}</h3>
                    <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold bg-neutral-100 px-2 py-1 rounded-sm">{template.category}</span>
                  </div>
                  
                  {/* Mobile Actions (Visible without hover) */}
                  <div className="mt-auto pt-4 md:hidden flex gap-2">
                     <button className="flex-1 py-2.5 bg-neutral-100 text-neutral-700 text-[10px] font-bold uppercase tracking-widest rounded-lg flex items-center justify-center gap-1.5">
                       <Eye className="w-3.5 h-3.5" /> Preview
                     </button>
                     <Link href={viewAllRoute} className="flex-1 py-2.5 bg-[#8B263E] text-white text-[10px] font-bold uppercase tracking-widest rounded-lg flex items-center justify-center gap-1.5">
                       <Wand2 className="w-3.5 h-3.5" /> Use
                     </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
        
        {/* Mobile Gradient Edge */}
        <div className="absolute top-0 right-0 bottom-0 w-12 bg-gradient-to-l from-[#FBF8F4] to-transparent pointer-events-none md:hidden z-10" />
      </div>

      <div className="mt-12 flex justify-center md:justify-end">
        <Link 
          href={viewAllRoute}
          className="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#8B263E] hover:text-[#6e1c2f] transition-colors"
        >
          View All {activeTab === 'einvites' ? 'eInvites' : 'Websites'}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

    </section>
  );
}
