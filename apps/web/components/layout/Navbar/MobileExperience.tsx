"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, LogIn, User, LogOut, LayoutDashboard } from "lucide-react";
import { FooterSocials } from "../Footer/FooterSocials";

interface MobileExperienceProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
  userName?: string;
  dashboardHref?: string;
  onLogout?: () => void;
}

export function MobileExperience({
  isOpen,
  onClose,
  user,
  userName = "User",
  dashboardHref = "/customer/overview",
  onLogout,
}: MobileExperienceProps) {
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
    { 
      label: "Wedding Studio", 
      href: "/wedding-studio",
      subItems: [
        { label: "Explore eInvites", href: "/e-invites" },
      ]
    },
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
              <Link href="/" onClick={onClose} className="flex items-center gap-2.5">
                {/* YM Icon */}
                <div className="relative overflow-hidden shrink-0" style={{ width: '46px', height: '46px' }}>
                  <Image
                    src="/assets/you_marriage_logo_transparent.png"
                    alt="You Marriage We Arrange logo"
                    width={46}
                    height={46}
                    className="absolute top-0 left-0 w-full h-full object-contain"
                  />
                </div>
                {/* Brand Text */}
                <div className="flex flex-col leading-none">
                  <span className="font-serif text-[14px] font-bold tracking-tight text-[#855F2E]">
                    YOU MARRIAGE
                  </span>
                  <span className="font-sans text-[8px] font-black uppercase tracking-[0.22em] text-[#8B263E] mt-0.5">
                    WE ARRANGE
                  </span>
                </div>
              </Link>

              <button
                onClick={onClose}
                aria-label="Close menu"
                className="p-2.5 -mr-2 text-neutral-400 hover:text-neutral-900 transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]"
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
                      prefetch={true}
                      onClick={(e) => {
                        if (item.subItems) {
                          toggleExpand(item.label, e);
                        } else {
                          onClose();
                        }
                      }}
                      className="flex items-center justify-between py-3.5 min-h-[48px] text-[#1A0810] hover:text-[#8B263E] transition-colors"
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
                          <div className="pb-4 pl-4 flex flex-col gap-1">
                            <Link
                              href={item.href}
                              prefetch={true}
                              onClick={onClose}
                              className="text-sm font-semibold text-neutral-700 hover:text-[#8B263E] min-h-[44px] flex items-center"
                            >
                              All {item.label}
                            </Link>
                            {item.subItems.map((subItem) => (
                              <Link
                                key={subItem.label}
                                href={subItem.href}
                                prefetch={true}
                                onClick={onClose}
                                className="text-sm text-neutral-600 hover:text-[#8B263E] min-h-[44px] flex items-center"
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

              <div className="pt-6 pb-2 flex flex-col gap-2.5">
                <div className="h-px bg-neutral-100 w-full mb-1" />

                {user ? (
                  <>
                    <div className="px-3 py-2 bg-[#FAF9F6] rounded-xl border border-[#8B263E]/10 mb-1">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#8B263E]/10 border border-[#8B263E]/20 flex items-center justify-center text-[#8B263E] font-bold text-xs">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-[#2D2D2D] truncate">{userName}</p>
                          {user.email && (
                            <p className="text-[10px] text-neutral-500 truncate">{user.email}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <Link
                      href={dashboardHref}
                      prefetch={true}
                      onClick={onClose}
                      className="flex items-center justify-between py-2 text-sm font-semibold text-[#8B263E] hover:text-[#701E31] transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <LayoutDashboard className="w-4 h-4 text-[#8B263E]" />
                        <span>My Dashboard</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#8B263E]/50" />
                    </Link>

                    {onLogout && (
                      <button
                        type="button"
                        onClick={() => {
                          onLogout();
                          onClose();
                        }}
                        className="flex items-center justify-between py-2 text-sm font-semibold text-neutral-500 hover:text-[#8B263E] transition-colors text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-neutral-300" />
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      prefetch={true}
                      onClick={onClose}
                      className="flex items-center justify-between py-2.5 text-sm font-semibold text-neutral-700 hover:text-[#8B263E] transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <LogIn className="w-4 h-4 text-[#8B263E]" />
                        <span>Login</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-neutral-300" />
                    </Link>
                  </>
                )}

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

