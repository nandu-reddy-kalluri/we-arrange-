```tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, User, LogOut } from "lucide-react";
import { User as SupabaseUser } from "@supabase/supabase-js";

import { DesktopNavigation } from "./DesktopNavigation";
import { MobileExperience } from "./MobileExperience";
import { useHoverIntent } from "./hooks/useHoverIntent";
import { useMegaMenu } from "./hooks/useMegaMenu";
import { SavedAction } from "./SavedAction";

import { supabase } from "@/services/supabase/client";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [scrolled, setScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Logged-in user
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { closeMenu } = useMegaMenu();

  const { onMouseEnter, onMouseLeave } = useHoverIntent({
    enterDelay: 120,
    leaveDelay: 180,
  });

  // -----------------------------------------
  // Scroll handling
  // -----------------------------------------
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // -----------------------------------------
  // Supabase Auth State
  // -----------------------------------------
  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!error) {
        setUser(user ?? null);
      }
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      setUser(session?.user ?? null);

      if (!session) {
        setShowUserMenu(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // -----------------------------------------
  // Logout
  // -----------------------------------------
  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Logout error:", error);
        return;
      }

      setUser(null);
      setShowUserMenu(false);

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Unexpected logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // -----------------------------------------
  // Navbar appearance
  // -----------------------------------------
  const isDarkHeroPage = pathname === "/";
  const useDarkText = !isDarkHeroPage || scrolled;

  // -----------------------------------------
  // User display name
  // -----------------------------------------
  const getUserName = () => {
    if (!user) return "Login";

    const fullName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.user_metadata?.display_name;

    if (fullName) {
      return fullName;
    }

    if (user.email) {
      return user.email.split("@")[0];
    }

    return "User";
  };

  const userName = getUserName();

  // -----------------------------------------
  // Profile / Login
  // -----------------------------------------
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
          {/* ----------------------------------------- */}
          {/* LEFT ZONE - BRAND */}
          {/* ----------------------------------------- */}

          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0"
            onMouseEnter={closeMenu}
          >
            {/* YM Icon */}
            <div
              className="relative overflow-hidden shrink-0"
              style={{
                width: "52px",
                height: "52px",
              }}
            >
              <Image
                src="/assets/you_marriage_logo_transparent.png"
                alt="You Marriage We Arrange"
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

            {/* Brand Text */}
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

          {/* ----------------------------------------- */}
          {/* CENTER ZONE - DISCOVERY */}
          {/* ----------------------------------------- */}

          <div className="flex-1 flex justify-center">
            <DesktopNavigation useDarkText={useDarkText} />
          </div>

          {/* ----------------------------------------- */}
          {/* RIGHT ZONE - DESKTOP */}
          {/* ----------------------------------------- */}

          <div
            className="hidden lg:flex items-center justify-end gap-3 xl:gap-5 shrink-0"
            onMouseEnter={closeMenu}
          >
            <SavedAction useDarkText={useDarkText} />

            {/* Divider */}
            <div
              className={`w-[1px] h-4 mx-1 ${
                useDarkText ? "bg-neutral-200" : "bg-white/20"
              }`}
            />

            {/* ----------------------------------------- */}
            {/* LOGIN / USER MENU */}
            {/* ----------------------------------------- */}

            {!user ? (
              <Link
                href="/login"
                className={`flex items-center gap-2 text-xs xl:text-sm font-semibold transition-all duration-300 ${
                  useDarkText
                    ? "text-[#2D2D2D] hover:text-[#8B263E]"
                    : "text-[#FAF9F6] drop-shadow-md hover:text-white"
                }`}
              >
                <User
                  className={`w-4 h-4 transition-colors duration-300 ${
                    useDarkText ? "text-[#6D6D6D]" : "text-white/70"
                  }`}
                />

                <span>Login</span>
              </Link>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserMenu((prev) => !prev)}
                  className={`flex items-center gap-2 text-xs xl:text-sm font-semibold transition-all duration-300 ${
                    useDarkText
                      ? "text-[#2D2D2D] hover:text-[#8B263E]"
                      : "text-[#FAF9F6] drop-shadow-md hover:text-white"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                      useDarkText
                        ? "bg-[#8B263E]/10 border-[#8B263E]/20"
                        : "bg-white/10 border-white/30"
                    }`}
                  >
                    <User
                      className={`w-4 h-4 ${
                        useDarkText ? "text-[#8B263E]" : "text-white"
                      }`}
                    />
                  </div>

                  <span className="max-w-[120px] truncate">
                    {userName}
                  </span>

                  <svg
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      showUserMenu ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <div
                    className="absolute right-0 top-full mt-3 w-56 bg-white rounded-xl shadow-xl border border-neutral-100 overflow-hidden"
                    onMouseLeave={() => setShowUserMenu(false)}
                  >
                    <div className="px-4 py-3 border-b border-neutral-100">
                      <p className="text-sm font-semibold text-[#2D2D2D] truncate">
                        {userName}
                      </p>

                      {user.email && (
                        <p className="text-xs text-neutral-500 mt-1 truncate">
                          {user.email}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#8B263E] hover:bg-[#8B263E]/5 transition-colors disabled:opacity-50"
                    >
                      <LogOut className="w-4 h-4" />

                      <span>
                        {isLoggingOut ? "Logging out..." : "Logout"}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ----------------------------------------- */}
          {/* MOBILE */}
          {/* ----------------------------------------- */}

          <div className="flex lg:hidden items-center gap-4">
            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              suppressHydrationWarning
              aria-label="Open menu"
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

      {/* ----------------------------------------- */}
      {/* MOBILE FULL SCREEN EXPERIENCE */}
      {/* ----------------------------------------- */}

      <MobileExperience
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
      />
    </>
  );
}
```
