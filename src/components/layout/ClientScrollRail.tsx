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

    const sections = ["hero", "meet-concierge", "how-it-works", "featured-venues"];
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const getActiveIndex = () => {
    if (activeSection === "hero") return 0;
    if (activeSection === "meet-concierge") return 1;
    if (activeSection === "how-it-works") return 2;
    if (activeSection === "featured-venues") return 3;
    return 0;
  };

  const topPosition = 5 + (getActiveIndex() * 48);

  return (
    <div className="hidden xl:flex fixed left-8 top-1/2 -translate-y-1/2 flex-col gap-6 z-40 items-start select-none">
      <div className="relative pl-6 flex flex-col gap-8">
        <div className="absolute left-[3px] top-1 bottom-1 w-[1px] bg-neutral-border" />
        <div 
          className="absolute left-0 w-2.5 h-2.5 rounded-full bg-primary transition-all duration-500 ease-out" 
          style={{ top: `${topPosition}px` }} 
        />

        <button 
          onClick={() => document.getElementById("hero")?.scrollIntoView({ behavior: "smooth" })} 
          className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors ${getActiveIndex() === 0 ? "text-primary" : "text-neutral-muted hover:text-neutral-charcoal"}`}
        >
          Dream
        </button>
        <button 
          onClick={() => document.getElementById("meet-concierge")?.scrollIntoView({ behavior: "smooth" })} 
          className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors ${getActiveIndex() === 1 ? "text-primary" : "text-neutral-muted hover:text-neutral-charcoal"}`}
        >
          Plan
        </button>
        <button 
          onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })} 
          className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors ${getActiveIndex() === 2 ? "text-primary" : "text-neutral-muted hover:text-neutral-charcoal"}`}
        >
          Compare
        </button>
        <button 
          onClick={() => document.getElementById("featured-venues")?.scrollIntoView({ behavior: "smooth" })} 
          className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors ${getActiveIndex() === 3 ? "text-primary" : "text-neutral-muted hover:text-neutral-charcoal"}`}
        >
          Choose
        </button>
      </div>
    </div>
  );
}
