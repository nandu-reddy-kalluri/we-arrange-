"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronDown, X, Heart, User } from "lucide-react";
import { NAVIGATION_HIERARCHY } from "./data/navigationData";

interface MobileExperienceProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileExperience({ isOpen, onClose }: MobileExperienceProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Lock body scroll when open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed inset-0 z-[110] bg-white overflow-y-auto flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-neutral-100 bg-white sticky top-0 z-10">
            <Link href="/" onClick={onClose} className="flex flex-col text-left">
              <span className="font-serif text-[18px] font-bold leading-none tracking-tight text-[#C5A880]">
                YouMarriage
              </span>
              <span className="font-sans text-[10px] uppercase tracking-widest text-[#8B263E] font-bold leading-none mt-0.5">
                WeArrange
              </span>
            </Link>
            <button 
              onClick={onClose}
              className="p-2 -mr-2 rounded-full text-neutral-400 hover:text-neutral-900 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Clean List Menu */}
          <div className="p-4 sm:p-6 flex flex-col gap-1 pb-32">
            {NAVIGATION_HIERARCHY.map((navItem) => (
              <div key={navItem.id} className="border-b border-neutral-100 last:border-0">
                <button
                  onClick={() => setExpandedSection(expandedSection === navItem.id ? null : navItem.id)}
                  className="w-full flex items-center justify-between py-5 text-left"
                >
                  <span className="font-serif text-2xl font-bold text-neutral-900">{navItem.label}</span>
                  <ChevronDown className={`w-5 h-5 text-neutral-400 transition-transform duration-300 ${expandedSection === navItem.id ? "rotate-180 text-[#8B263E]" : ""}`} />
                </button>
                
                <AnimatePresence>
                  {expandedSection === navItem.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pb-6 flex flex-col gap-6">
                        {navItem.type === "mega-menu" && navItem.sections ? (
                          navItem.sections.map((section) => (
                            <div key={section.title} className="flex flex-col gap-3">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-[#C5A880]">
                                {section.title}
                              </span>
                              <div className="flex flex-col gap-3 pl-2">
                                {section.items.map((subItem) => (
                                  <Link
                                    key={subItem.label}
                                    href={subItem.href}
                                    onClick={onClose}
                                    className="text-sm font-medium text-neutral-600 hover:text-[#8B263E]"
                                  >
                                    {subItem.label}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))
                        ) : navItem.type === "dropdown" && navItem.items ? (
                          <div className="flex flex-col gap-3 pl-2">
                            {navItem.items.map((subItem) => (
                              <Link
                                key={subItem.label}
                                href={subItem.href}
                                onClick={onClose}
                                className="text-sm font-medium text-neutral-600 hover:text-[#8B263E]"
                              >
                                {subItem.label}
                              </Link>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            {/* Bottom Utilities */}
            <div className="mt-8 pt-6 border-t border-neutral-100 flex flex-col gap-2">
              <Link
                href="/saved"
                onClick={onClose}
                className="flex items-center gap-3 py-4 text-neutral-700 font-semibold"
              >
                <div className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center">
                  <Heart className="w-5 h-5" />
                </div>
                Saved
              </Link>
              <Link
                href="/login"
                onClick={onClose}
                className="flex items-center gap-3 py-4 text-neutral-700 font-semibold"
              >
                <div className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                Login
              </Link>
              <Link
                href="/register"
                onClick={onClose}
                className="w-full mt-4 py-4 rounded-full text-center text-sm font-bold text-white bg-[#8B263E]"
              >
                Create Account
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
