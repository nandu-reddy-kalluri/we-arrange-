"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { useMegaMenu } from "./hooks/useMegaMenu";
import { NAV_LINKS } from "./data/navigation";
import { NavigationPreview } from "./NavigationPreview/index";

export function DesktopNavigation() {
  const { activeTab, setActiveTab, setPanelOpen } = useMegaMenu();
  const navRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = (id: string) => {
    setActiveTab(id);
    setPanelOpen(true);
  };

  return (
    <LazyMotion features={domAnimation}>
      <div className="hidden lg:flex items-center gap-2 xl:gap-4 relative" ref={navRef}>
        {NAV_LINKS.map((link) => {
          const isActive = activeTab === link.id;

          return (
            <div 
              key={link.id} 
              className="relative"
              onMouseEnter={() => handleMouseEnter(link.id)}
            >
              {/* Active Pill Background */}
              {isActive && (
                <m.div
                  layoutId="activePill"
                  className="absolute inset-0 bg-[#F5F2EB]/80 rounded-full z-0"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              
              <Link
                href={link.href}
                className={`relative z-10 px-4 py-2 block text-xs xl:text-sm font-semibold transition-colors duration-200 ${
                  isActive ? "text-[#8B263E]" : "text-[#2D2D2D] hover:text-[#8B263E]"
                }`}
              >
                {link.name}
              </Link>

              {/* Localized Floating Preview Card */}
              {isActive && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-0 z-50">
                  <NavigationPreview activeTab={activeTab} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </LazyMotion>
  );
}
