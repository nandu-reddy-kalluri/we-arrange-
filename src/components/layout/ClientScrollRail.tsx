"use client";

import React, { useState, useEffect } from "react";

export function ClientScrollRail() {
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-30% 0px -70% 0px" } // Triggers when element crosses top third
    );

    const sections = ["hero", "concierge-journey", "featured-venues", "featured-vendors"];
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const getActiveIndex = () => {
    if (activeSection === "hero") return 0;
    if (activeSection === "concierge-journey") return 1;
    if (activeSection === "featured-venues") return 2;
    if (activeSection === "featured-vendors") return 3;
    return 0;
  };

  const topPosition = 5 + (getActiveIndex() * 48);

  return (
    <div className="hidden 2xl:flex fixed left-6 top-1/2 -translate-y-1/2 flex-col z-40 items-start select-none bg-white/90 backdrop-blur-md border border-[#E8D8BC]/60 rounded-2xl py-4 px-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-md transition-all duration-300">
      <div className="relative pl-5 flex flex-col gap-6">
        <div className="absolute left-[3px] top-1.5 bottom-1.5 w-[1.5px] bg-[#E8D8BC]/60 rounded-full" />
        <div 
          className="absolute left-0 w-2 h-2 rounded-full bg-[#8B263E] shadow-sm transition-all duration-500 ease-out" 
          style={{ top: `${topPosition}px` }} 
        />

        <button 
          onClick={() => document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" })} 
          className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors ${getActiveIndex() === 0 ? "text-[#8B263E]" : "text-neutral-500 hover:text-neutral-900"}`}
        >
          Dream
        </button>
        <button 
          onClick={() => document.getElementById("concierge-journey")?.scrollIntoView({ behavior: "smooth" })} 
          className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors ${getActiveIndex() === 1 ? "text-[#8B263E]" : "text-neutral-500 hover:text-neutral-900"}`}
        >
          Journey
        </button>
        <button 
          onClick={() => document.getElementById("featured-venues")?.scrollIntoView({ behavior: "smooth" })} 
          className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors ${getActiveIndex() === 2 ? "text-[#8B263E]" : "text-neutral-500 hover:text-neutral-900"}`}
        >
          Venues
        </button>
        <button 
          onClick={() => document.getElementById("featured-vendors")?.scrollIntoView({ behavior: "smooth" })} 
          className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors ${getActiveIndex() === 3 ? "text-[#8B263E]" : "text-neutral-500 hover:text-neutral-900"}`}
        >
          Vendors
        </button>
      </div>
    </div>
  );
}
