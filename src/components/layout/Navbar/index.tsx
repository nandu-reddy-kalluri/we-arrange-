"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, User } from "lucide-react";
import { DesktopNavigation } from "./DesktopNavigation";
import { MobileExperience } from "./MobileExperience";
import { useHoverIntent } from "./hooks/useHoverIntent";
import { useMegaMenu } from "./hooks/useMegaMenu";
import { PremiumSearchAction } from "./PremiumSearchAction";
import { SavedAction } from "./SavedAction";

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { closeMenu } = useMegaMenu();

  // Handle Navbar hover intent
  const { onMouseEnter, onMouseLeave } = useHoverIntent({
    enterDelay: 120,
    leaveDelay: 180
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isDarkHeroPage = [
    "/",
    "/vendors",
  ].includes(pathname);

  const useDarkText = !isDarkHeroPage || scrolled;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
          ? "py-2.5 bg-white/90 backdrop-blur-md shadow-[0_4px_20px_-10px_rgba(0,0,0,0.08)]"
          : `py-4 ${isDarkHeroPage ? "bg-gradient-to-b from-black/40 to-transparent backdrop-blur-[2px]" : "bg-[#FAF9F6] border-b border-[#8B263E]/[0.04]"}`
          }`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={() => {
          onMouseLeave();
          // Delay closing the menu to allow smooth transition away
          setTimeout(() => {
            closeMenu();
          }, 180);
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">

          {/* Left Zone: Brand Logo Anchor */}
          <Link href="/" className="flex items-center gap-2 group shrink-0" onMouseEnter={closeMenu}>
            <div className="relative flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-[#C5A880] fill-current">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" className="opacity-10" />
                <path d="M12 4a3 3 0 0 0-3 3c0 2.2 2 4.5 3 5.5 1-1 3-3.3 3-5.5a3 3 0 0 0-3-3zm0 4.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                <path d="M6 19a6 6 0 0 1 12 0H6z" />
              </svg>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-serif text-[18px] lg:text-[21px] font-bold leading-none tracking-tight text-[#C5A880]">
                YouMarriage
              </span>
              <span className="font-sans text-[10px] uppercase tracking-widest text-[#8B263E] font-bold leading-none mt-0.5">
                WeArrange
              </span>
            </div>
          </Link>

          {/* Center Zone: Discovery (Desktop) */}
          <div className="flex-1 flex justify-center">
            <DesktopNavigation useDarkText={useDarkText} />
          </div>

          {/* Right Zone: Utility Actions (Desktop) */}
          <div className="hidden lg:flex items-center justify-end gap-3 xl:gap-5 shrink-0" onMouseEnter={closeMenu}>
            <PremiumSearchAction onMenuClose={closeMenu} useDarkText={useDarkText} />
            <SavedAction useDarkText={useDarkText} />

            <div className={`w-[1px] h-4 mx-1 ${useDarkText ? "bg-neutral-200" : "bg-white/20"}`} />

            <Link
              href="/login"
              className={`flex items-center gap-2 text-xs xl:text-sm font-semibold transition-all duration-300 ${useDarkText ? "text-[#2D2D2D] hover:text-[#8B263E]" : "text-[#FAF9F6] drop-shadow-md hover:text-white"}`}
            >
              <User className={`w-4 h-4 transition-colors duration-300 ${useDarkText ? "text-[#6D6D6D]" : "text-white/70"}`} />
              <span className="hidden xl:inline">Login</span>
            </Link>

            <Link
              href="/register"
              className="px-4 py-2 rounded-full text-xs xl:text-sm font-bold text-white bg-[#8B263E] hover:bg-[#6e1c2f] transition-all duration-200 shadow-sm"
            >
              Register
            </Link>
          </div>

          {/* Mobile Right Zone: Quick Utility & Menu */}
          <div className="flex lg:hidden items-center gap-4">
            <PremiumSearchAction onMenuClose={closeMenu} useDarkText={useDarkText} />
            <button
              onClick={() => setIsMobileOpen(true)}
              suppressHydrationWarning={true}
              className={`p-2 -mr-2 rounded-md transition-colors duration-300 ${useDarkText ? "text-[#2D2D2D] hover:text-[#8B263E]" : "text-white hover:text-white/80"}`}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Full Screen Experience */}
      <MobileExperience isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />
    </>
  );
}
