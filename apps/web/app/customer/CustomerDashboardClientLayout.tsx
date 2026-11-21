"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Settings, Heart, CalendarCheck, LogOut, User, Sparkles } from "lucide-react";
import { apiClient } from "@we-arrange/api-client";
import { useAuth } from "@/context/AuthContext";
import { useSavedStore } from "@/store/useSavedStore";

export default function CustomerDashboardClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const { savedVenueIds, savedVendorIds, syncWithServer } = useSavedStore();
  const [mounted, setMounted] = useState(false);
  const [profileName, setProfileName] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!user) {
      setProfileName(null);
      return;
    }
    void syncWithServer();
    let active = true;
    void apiClient.get<{ fullName?: string }>("/api/auth/me").then((res) => {
      if (active && res.ok && res.data?.fullName) {
        setProfileName(res.data.fullName);
      }
    });
    return () => {
      active = false;
    };
  }, [user, syncWithServer]);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/";
    } catch (error) {
      console.error("LOGOUT ERROR:", error);
    }
  };

  const userName =
    profileName ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.user_metadata?.display_name ||
    user?.email?.split("@")[0] ||
    "Member";

  const totalSaved = mounted ? savedVenueIds.length + savedVendorIds.length : 0;
  const isOverviewActive = pathname === "/customer/overview" || pathname === "/customer";
  const isSavedActive = pathname.startsWith("/customer/saved");
  const isBookingsActive = pathname.startsWith("/customer/bookings");
  const isSettingsActive = pathname.startsWith("/customer/settings");

  return (
    <main
      id="main-content"
      className="min-h-screen bg-[#FAF9F6] pt-20 lg:pt-24 font-sans"
      aria-label="Customer Dashboard"
    >
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)] max-w-7xl mx-auto">
        {/* PERSISTENT SIDEBAR */}
        <aside
          aria-label="Customer account navigation"
          className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-[#8B263E]/10 bg-white px-4 sm:px-6 py-6 lg:py-10 flex flex-col shrink-0"
        >
          <div className="mb-5 lg:mb-8">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#8B263E]">
                  Customer Account
                </p>
                <h2 className="mt-1 text-2xl font-serif text-[#2D2D2D] font-bold truncate">
                  {userName}
                </h2>
                <p className="mt-0.5 text-xs text-neutral-600 truncate">
                  {user?.email || "Wedding Planning Portal"}
                </p>
              </div>
              <div className="lg:hidden shrink-0">
                {user ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#8B263E]/20 text-[#8B263E] hover:bg-[#F5EEE7] text-xs font-semibold cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#8B263E] text-white text-xs font-semibold"
                  >
                    <User className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Sign In</span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          <nav
            aria-label="Account sections"
            className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none"
          >
            <Link
              href="/customer/overview"
              aria-current={isOverviewActive ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs lg:text-sm whitespace-nowrap transition-colors ${
                isOverviewActive
                  ? "bg-[#F5EEE7] text-[#8B263E] font-semibold"
                  : "font-medium text-neutral-600 hover:bg-[#F5EEE7] hover:text-[#8B263E]"
              }`}
            >
              <Home className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Overview</span>
            </Link>

            <Link
              href="/customer/saved"
              aria-current={isSavedActive ? "page" : undefined}
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
                  aria-hidden="true"
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
              href="/customer/bookings"
              aria-current={isBookingsActive ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs lg:text-sm whitespace-nowrap transition-colors ${
                isBookingsActive
                  ? "bg-[#F5EEE7] text-[#8B263E] font-semibold"
                  : "font-medium text-neutral-600 hover:bg-[#F5EEE7] hover:text-[#8B263E]"
              }`}
            >
              <CalendarCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Bookings</span>
            </Link>

            <Link
              href="/customer/settings"
              aria-current={isSettingsActive ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs lg:text-sm whitespace-nowrap transition-colors ${
                isSettingsActive
                  ? "bg-[#F5EEE7] text-[#8B263E] font-semibold"
                  : "font-medium text-neutral-600 hover:bg-[#F5EEE7] hover:text-[#8B263E]"
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Settings</span>
            </Link>
          </nav>

          <div className="hidden lg:block mt-auto pt-10 border-t border-neutral-100">
            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-500 hover:text-[#8B263E] hover:bg-[#8B263E]/5 transition-colors text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                <span>Sign Out</span>
              </button>
            ) : (
              <Link
                href="/login"
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#8B263E] bg-[#8B263E]/5 hover:bg-[#8B263E]/10 transition-colors"
              >
                <User className="w-4 h-4" aria-hidden="true" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </aside>

        {/* MAIN SECTION CONTENT */}
        <section
          aria-label="Dashboard Content"
          className="flex-1 px-4 sm:px-8 lg:px-12 py-8 lg:py-10 min-h-[560px]"
        >
          {loading ? (
            <div className="flex items-center justify-center min-h-[480px]" aria-label="Loading dashboard content">
              <div className="w-full max-w-md p-8 bg-white rounded-2xl border border-[#8B263E]/10 shadow-sm my-8 animate-pulse text-center">
                <div className="w-12 h-12 rounded-full bg-[#8B263E]/10 mx-auto mb-4" />
                <div className="h-7 bg-neutral-200 rounded-lg w-48 mx-auto mb-3" />
                <div className="h-4 bg-neutral-100 rounded w-full max-w-xs mx-auto mb-2" />
                <div className="h-4 bg-neutral-100 rounded w-3/4 mx-auto mb-6" />
                <div className="h-10 bg-[#8B263E]/20 rounded-full w-48 mx-auto" />
              </div>
            </div>
          ) : !user ? (
            <div className="flex items-center justify-center min-h-[480px]">
              <div className="text-center max-w-md w-full p-8 bg-white rounded-2xl border border-[#8B263E]/10 shadow-sm my-8">
                <div className="w-12 h-12 rounded-full bg-[#8B263E]/10 text-[#8B263E] flex items-center justify-center mx-auto mb-4 font-serif text-xl font-bold">
                  YM
                </div>
                <h1 className="text-2xl font-serif text-[#2D2D2D] font-bold">
                  Please sign in first
                </h1>
                <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                  Sign in to view and manage your wedding planning checklist, saved venues, and concierge requests.
                </p>
                <Link
                  href="/login"
                  className="inline-block mt-6 px-8 py-3 rounded-full bg-[#8B263E] hover:bg-[#701E31] text-white font-semibold text-xs tracking-wider uppercase transition-colors shadow-sm"
                >
                  Sign In to Dashboard
                </Link>
              </div>
            </div>
          ) : (
            children
          )}
        </section>
      </div>
    </main>
  );
}
