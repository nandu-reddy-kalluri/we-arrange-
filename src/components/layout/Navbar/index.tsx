"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, User } from "lucide-react";

import { DesktopNavigation } from "./DesktopNavigation";
import { MobileExperience } from "./MobileExperience";
import { useHoverIntent } from "./hooks/useHoverIntent";
import { useMegaMenu } from "./hooks/useMegaMenu";
import { SavedAction } from "./SavedAction";

import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [scrolled, setScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { user } = useAuth();

  const { closeMenu } = useMegaMenu();

  const { onMouseEnter, onMouseLeave } = useHoverIntent({
    enterDelay: 120,
    leaveDelay: 180,
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const isDarkHeroPage = ["/"].includes(pathname);

  const useDarkText = !isDarkHeroPage || scrolled;

  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Profile";

  // ------------------------------------------
  // PROFILE / LOGIN
  // ------------------------------------------

  const handleProfileClick = () => {
    if (user) {
      router.push("/customer/overview");
    } else {
      router.push("/login");
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "py-2.5 bg-white/90 backdrop-blur-md shadow-[0_4px_20px_-10px_rgba(0,0,0,0.08)]"
            : `py-4 ${
                isDarkHeroPage
                  ? "bg-gradient-to-b from-black/40 to-transparent backdrop-blur-[2px]"
                  : "bg-[#FAF9F6] border-b border-[#8B263E]/[0.04]"
              }`
        }`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={() => {
          onMouseLeave();

          setTimeout(() => {
            closeMenu();
          }, 180);
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">

          {/* ------------------------------------------ */}
          {/* LEFT ZONE - BRAND */}
          {/* ------------------------------------------ */}

          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0"
            onMouseEnter={closeMenu}
          >
            <div
              className="relative overflow-hidden shrink-0"
              style={{
                width: "52px",
                height: "52px",
              }}
            >
              <Image
                src="/assets/you_marriage_logo_transparent.png"
                alt=""
                width={52}
                height={68}
                className={`absolute top-0 left-0 w-full transition-all duration-300 ${
                  useDarkText
                    ? ""
                    : "brightness-[1.5] sepia-[0.35] saturate-[1.4] drop-shadow-[0_0_8px_rgba(240,210,141,0.35)]"
                }`}
                style={{
                  height: "auto",
                }}
                unoptimized
                priority
              />
            </div>

            <div className="flex flex-col leading-none">
              <span
                className={`font-serif text-[15px] lg:text-[17px] font-bold tracking-tight transition-colors duration-300 ${
                  useDarkText
                    ? "text-[#C5A880]"
                    : "text-[#F0D28D] drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]"
                }`}
              >
                YOU MARRIAGE
              </span>

              <span className="font-sans text-[8px] lg:text-[10px] font-black uppercase tracking-[0.22em] text-[#8B263E] mt-0.5">
                WE ARRANGE
              </span>
            </div>
          </Link>

          {/* ------------------------------------------ */}
          {/* CENTER ZONE - DISCOVERY */}
          {/* ------------------------------------------ */}

          <div className="flex-1 flex justify-center">
            <DesktopNavigation
              useDarkText={useDarkText}
            />
          </div>

          {/* ------------------------------------------ */}
          {/* RIGHT ZONE */}
          {/* ------------------------------------------ */}

          <div
            className="hidden lg:flex items-center justify-end gap-3 xl:gap-5 shrink-0"
            onMouseEnter={closeMenu}
          >
            {/* SAVED */}

            <SavedAction
              useDarkText={useDarkText}
            />

            {/* DIVIDER */}

            <div
              className={`w-[1px] h-4 mx-1 ${
                useDarkText
                  ? "bg-neutral-200"
                  : "bg-white/20"
              }`}
            />

            {/* PROFILE / LOGIN */}

            <button
              type="button"
              onClick={handleProfileClick}
              className={`flex items-center gap-2 text-xs xl:text-sm font-semibold transition-all duration-300 ${
                useDarkText
                  ? "text-[#2D2D2D] hover:text-[#8B263E]"
                  : "text-[#FAF9F6] drop-shadow-md hover:text-white"
              }`}
            >
              <User
                className={`w-4 h-4 transition-colors duration-300 ${
                  useDarkText
                    ? "text-[#6D6D6D]"
                    : "text-white/70"
                }`}
              />

              <span>
                {user ? userName : "Login"}
              </span>
            </button>
          </div>

          {/* ------------------------------------------ */}
          {/* MOBILE */}
          {/* ------------------------------------------ */}

          <div className="flex lg:hidden items-center gap-4">
            <button
              onClick={() =>
                setIsMobileOpen(true)
              }
              suppressHydrationWarning={true}
              className={`p-2 -mr-2 rounded-md transition-colors duration-300 ${
                useDarkText
                  ? "text-[#2D2D2D] hover:text-[#8B263E]"
                  : "text-white hover:text-white/80"
              }`}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* ------------------------------------------ */}
      {/* MOBILE FULL SCREEN EXPERIENCE */}
      {/* ------------------------------------------ */}

      <MobileExperience
        isOpen={isMobileOpen}
        onClose={() =>
          setIsMobileOpen(false)
        }
      />
    </>
  );
}