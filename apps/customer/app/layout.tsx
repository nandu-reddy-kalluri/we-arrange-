"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Settings, Heart, CalendarCheck, LogOut, Sparkles } from "lucide-react";
import { AuthProvider, useAuth } from "@we-arrange/auth";
import { useSavedStore } from "../store/useSavedStore";
import "./globals.css";

function CustomerShell({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const { savedVenueIds, savedVendorIds } = useSavedStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/";
    } catch (error) {
      console.error("LOGOUT ERROR:", error);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAF9F6] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#8B263E] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-[0.2em] text-[#8B263E] font-semibold">
            Loading your dashboard...
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#FAF9F6] flex items-center justify-center px-4 font-sans">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl border border-[#8B263E]/10 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[#8B263E]/10 text-[#8B263E] flex items-center justify-center mx-auto mb-4 font-serif text-xl font-bold">
            YM
          </div>
          <h1 className="text-2xl font-serif text-[#2D2D2D] font-bold">
            Please sign in first
          </h1>
          <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
            Sign in to view and manage your wedding planning checklist, saved venues, and concierge requests.
          </p>

          <Link
            href="/login?redirect=/customer/overview"
            className="inline-block mt-6 px-8 py-3 rounded-full bg-[#8B263E] hover:bg-[#701E31] text-white font-semibold text-xs tracking-wider uppercase transition-colors shadow-sm"
          >
            Sign In to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const userName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.user_metadata?.display_name ||
    user.email?.split("@")[0] ||
    "User";

  const totalSaved = mounted ? savedVenueIds.length + savedVendorIds.length : 0;

  const isOverviewActive =
    pathname === "/" || pathname === "/overview" || pathname.endsWith("/overview");
  const isSavedActive = pathname.includes("/saved");
  const isBookingsActive = pathname.includes("/bookings");
  const isSettingsActive = pathname.includes("/settings");

  return (
    <div className="min-h-screen bg-[#FAF9F6] pt-6 lg:pt-8 font-sans">
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-40px)] max-w-7xl mx-auto">
        {/* PERSISTENT SIDEBAR */}
        <aside className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-[#8B263E]/10 bg-white px-4 sm:px-6 py-6 lg:py-10 flex flex-col shrink-0">
          <div className="mb-6 lg:mb-10">
            <Link href="/" className="inline-block mb-3">
              <span className="font-serif text-sm font-bold tracking-tight text-[#8B263E]">
                YOU MARRIAGE
              </span>
              <span className="block text-[8px] font-sans font-black tracking-widest text-[#C5A880]">
                WE ARRANGE
              </span>
            </Link>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#8B263E]">
              My Account
            </p>
            <h2 className="mt-1 text-2xl font-serif text-[#2D2D2D] font-bold truncate">
              {userName}
            </h2>
            {user.email && (
              <p className="mt-0.5 text-xs text-neutral-400 truncate">
                {user.email}
              </p>
            )}
          </div>

          <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            <Link
              href="/overview"
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs lg:text-sm whitespace-nowrap transition-colors ${
                isOverviewActive
                  ? "bg-[#F5EEE7] text-[#8B263E] font-semibold"
                  : "font-medium text-neutral-600 hover:bg-[#F5EEE7] hover:text-[#8B263E]"
              }`}
            >
              <Home className="w-4 h-4 shrink-0" />
              <span>Overview</span>
            </Link>

            <Link
              href="/saved"
              className={`flex items-center justify-between gap-3 rounded-xl px-4 py-2.5 text-xs lg:text-sm whitespace-nowrap transition-colors ${
                isSavedActive
                  ? "bg-[#F5EEE7] text-[#8B263E] font-semibold"
                  : "font-medium text-neutral-600 hover:bg-[#F5EEE7] hover:text-[#8B263E]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Heart
                  className={`w-4 h-4 shrink-0 ${
                    isSavedActive ? "fill-[#8B263E] text-[#8B263E]" : "text-[#8B263E]"
                  }`}
                />
                <span>Saved Shortlist</span>
              </div>
              {totalSaved > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#8B263E] text-white">
                  {totalSaved}
                </span>
              )}
            </Link>

            <Link
              href="/bookings"
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs lg:text-sm whitespace-nowrap transition-colors ${
                isBookingsActive
                  ? "bg-[#F5EEE7] text-[#8B263E] font-semibold"
                  : "font-medium text-neutral-600 hover:bg-[#F5EEE7] hover:text-[#8B263E]"
              }`}
            >
              <CalendarCheck className="w-4 h-4 shrink-0" />
              <span>Bookings</span>
            </Link>

            <Link
              href="/settings"
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs lg:text-sm whitespace-nowrap transition-colors ${
                isSettingsActive
                  ? "bg-[#F5EEE7] text-[#8B263E] font-semibold"
                  : "font-medium text-neutral-600 hover:bg-[#F5EEE7] hover:text-[#8B263E]"
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span>Settings</span>
            </Link>
          </nav>

          <div className="hidden lg:block mt-auto pt-10 border-t border-neutral-100">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-500 hover:text-[#8B263E] hover:bg-[#8B263E]/5 transition-colors text-left cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <section className="flex-1 px-4 sm:px-8 lg:px-12 py-8 lg:py-10">
          {children}
        </section>
      </div>
    </div>
  );
}

export default function CustomerRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CustomerShell>{children}</CustomerShell>
        </AuthProvider>
      </body>
    </html>
  );
}
