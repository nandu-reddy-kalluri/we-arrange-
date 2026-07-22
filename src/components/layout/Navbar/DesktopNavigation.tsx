"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { NAVIGATION_HIERARCHY, NavItem } from "./data/navigationData";
import { ChevronDown } from "lucide-react";

export function DesktopNavigation() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (id: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(id);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 150);
  };

  return (
    <div className="hidden lg:flex items-center gap-6 xl:gap-8 relative" onMouseLeave={handleMouseLeave}>
      {NAVIGATION_HIERARCHY.map((navItem) => {
        const isActive = activeMenu === navItem.id;

        return (
          <div key={navItem.id} className="relative" onMouseEnter={() => handleMouseEnter(navItem.id)}>
            <Link
              href={navItem.href}
              className={`flex items-center gap-1.5 py-6 text-sm font-semibold transition-colors duration-200 ${
                isActive ? "text-[#8B263E]" : "text-[#2D2D2D] hover:text-[#8B263E]"
              }`}
            >
              {navItem.label}
              {(navItem.type === "dropdown" || navItem.type === "mega-menu") && (
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isActive ? "rotate-180 text-[#8B263E]" : "text-neutral-400"}`} />
              )}
            </Link>

            <AnimatePresence>
              {isActive && navItem.type === "dropdown" && navItem.items && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 2 }}
                  transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
                  className="absolute top-[100%] left-1/2 -translate-x-1/2 min-w-[220px] bg-white border border-neutral-100 shadow-[0_12px_32px_rgba(0,0,0,0.06)] rounded-xl overflow-hidden py-3 z-50"
                >
                  {navItem.items.map((subItem) => (
                    <Link
                      key={subItem.label}
                      href={subItem.href}
                      className="block px-5 py-2.5 text-[13px] font-medium text-neutral-600 hover:text-[#8B263E] hover:bg-neutral-50 transition-colors"
                      onClick={() => setActiveMenu(null)}
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </motion.div>
              )}

              {isActive && navItem.type === "mega-menu" && navItem.sections && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 2 }}
                  transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
                  className={`absolute top-[100%] ${navItem.id === 'vendors' ? 'left-1/2 -translate-x-1/2 w-[800px]' : 'left-0 w-[500px]'} bg-white border border-neutral-100 shadow-[0_12px_40px_rgba(0,0,0,0.08)] rounded-xl overflow-hidden p-8 z-50`}
                >
                  <div className={`grid gap-8 ${navItem.id === 'vendors' ? 'grid-cols-4' : 'grid-cols-2'}`}>
                    {navItem.sections.map((section) => (
                      <div key={section.title} className="flex flex-col gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5A880] mb-2">
                          {section.title}
                        </span>
                        <div className="flex flex-col gap-2">
                          {section.items.map((subItem) => (
                            <Link
                              key={subItem.label}
                              href={subItem.href}
                              className="text-[13px] font-medium text-neutral-600 hover:text-[#8B263E] transition-colors"
                              onClick={() => setActiveMenu(null)}
                            >
                              {subItem.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {navItem.id === 'vendors' && (
                    <div className="mt-8 pt-6 border-t border-neutral-100 flex justify-center">
                      <Link 
                        href="/vendors"
                        className="text-[11px] font-bold uppercase tracking-widest text-[#8B263E] hover:text-[#6e1c2f] transition-colors flex items-center gap-1"
                        onClick={() => setActiveMenu(null)}
                      >
                        View All Vendors
                        <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                      </Link>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
