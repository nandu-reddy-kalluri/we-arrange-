"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, ChevronRight, LogIn } from "lucide-react";
import { FooterSocials } from "../Footer/FooterSocials";

interface MobileExperienceProps {
  isOpen: boolean;
  onClose: () => void;
}



export function MobileExperience({ isOpen, onClose }: MobileExperienceProps) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const toggleExpand = (label: string, e: React.MouseEvent) => {
    e.preventDefault();
    setExpandedItem(prev => (prev === label ? null : label));
  };

  const navLinks = [
    { label: "Venues", href: "/venues" },
    { 
      label: "Vendors", 
      href: "/vendors",
      subItems: [
        { label: "Photography", href: "/vendors/photography" },
        { label: "Makeup", href: "/vendors/makeup" },
        { label: "Mehendi", href: "/vendors/mehendi" },
        { label: "Decor", href: "/vendors/decor" },
        { label: "Catering", href: "/vendors/catering" },
      ]
    },
    { label: "Wedding Studio", href: "/wedding-studio" },
    { label: "Inspiration", href: "/inspiration" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[109] bg-black/50 backdrop-blur-sm"
          />

          {/* Slide-in panel from right */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 35 }}
            className="fixed top-0 right-0 bottom-0 z-[110] w-[85vw] max-w-xs bg-white flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-neutral-100">
              <Link href="/" onClick={onClose} className="flex flex-col text-left">
                <span className="font-serif text-[19px] font-bold leading-none tracking-tight text-[#C5A880]">
                  YouMarriage
                </span>
                <span className="font-sans text-[9px] uppercase tracking-[0.25em] text-[#8B263E] font-bold leading-none mt-1">
                  WE ARRANGE
                </span>
              </Link>

              <button
                onClick={onClose}
                aria-label="Close menu"
                className="p-2 -mr-2 text-neutral-400 hover:text-neutral-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simple Direct Navigation List */}
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col justify-between">
              <nav className="flex flex-col">
                {navLinks.map((item) => (
                  <div key={item.label} className="border-b border-neutral-100">
                    <Link
                      href={item.href}
                      onClick={(e) => {
                        if (item.subItems) {
                          toggleExpand(item.label, e);
                        } else {
                          onClose();
                        }
                      }}
                      className="flex items-center justify-between py-4 text-[#1A0810] hover:text-[#8B263E] transition-colors"
                    >
                      <span className="font-serif text-lg font-bold">
                        {item.label}
                      </span>
                      <ChevronRight className={`w-4 h-4 text-neutral-300 transition-transform ${expandedItem === item.label ? 'rotate-90' : ''}`} />
                    </Link>
                    
                    <AnimatePresence>
                      {item.subItems && expandedItem === item.label && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pb-4 pl-4 flex flex-col gap-3">
                            <Link
                              href={item.href}
                              onClick={onClose}
                              className="text-sm font-semibold text-neutral-700 hover:text-[#8B263E]"
                            >
                              All {item.label}
                            </Link>
                            {item.subItems.map((subItem) => (
                              <Link
                                key={subItem.label}
                                href={subItem.href}
                                onClick={onClose}
                                className="text-sm text-neutral-600 hover:text-[#8B263E]"
                              >
                                {subItem.label}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </nav>

              <div className="pt-6 pb-2 flex flex-col gap-3">
                <div className="h-px bg-neutral-100 w-full mb-1" />

                <Link
                  href="/saved"
                  onClick={onClose}
                  className="flex items-center justify-between py-2.5 text-sm font-semibold text-neutral-700 hover:text-[#8B263E] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Heart className="w-4 h-4 text-[#8B263E]" />
                    <span>Saved</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-300" />
                </Link>

                <Link
                  href="/login"
                  onClick={onClose}
                  className="flex items-center justify-between py-2.5 text-sm font-semibold text-neutral-700 hover:text-[#8B263E] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <LogIn className="w-4 h-4 text-[#8B263E]" />
                    <span>Login</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-300" />
                </Link>

                <Link
                  href="/register"
                  onClick={onClose}
                  className="w-full mt-2 py-3 rounded-full text-center text-xs font-bold uppercase tracking-widest text-white bg-[#8B263E] hover:bg-[#6e1c2f] transition-all shadow-sm"
                >
                  Create Account
                </Link>

                {/* Social icons */}
                <div className="pt-4 flex justify-center">
                  <FooterSocials />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

