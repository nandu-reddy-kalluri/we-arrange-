"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  ExternalLink,
  LogOut,
  Sparkles,
  Shield,
  CheckCircle2,
} from "lucide-react";

interface AdminHeaderProps {
  onOpenMobileMenu?: () => void;
}

export function AdminHeader({ onOpenMobileMenu }: AdminHeaderProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("ymwa_admin_tab_authenticated");
    }
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.push("/concierge-portal/login");
      router.refresh();
    } catch {
      router.push("/concierge-portal/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-[#E5E0D8] px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      {/* Left side: Hamburger Toggle & Title on mobile */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-neutral-600 hover:bg-neutral-100 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="font-serif font-bold text-base sm:text-lg text-[#8B263E] tracking-tight">
            YMWA Admin
          </span>
          <span className="hidden sm:inline-block text-[11px] text-neutral-400 font-medium border-l border-neutral-200 pl-2">
            Hospitality Console
          </span>
        </div>
      </div>

      {/* Right side: Status, Live Site, Profile, Logout */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Connection status badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5ED] border border-[#C8A165]/30 text-[11px] font-semibold text-neutral-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>🟢 Supabase Connected</span>
        </div>

        {/* View Live Site button */}
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-neutral-700 bg-[#FBF9F6] hover:bg-[#FAF5ED] hover:text-[#8B263E] border border-[#E5E0D8] transition-all"
        >
          <span>View Live Site</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        {/* Admin Profile Pill */}
        <div className="hidden sm:flex items-center gap-2 pl-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8B263E] to-[#C8A165] flex items-center justify-center text-white text-xs font-bold shadow-sm">
            AD
          </div>
          <div className="hidden xl:flex flex-col text-left leading-none">
            <span className="text-xs font-bold text-neutral-800">
              Chief Concierge
            </span>
            <span className="text-[10px] text-neutral-400">
              Administrator
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-700 hover:bg-red-50 border border-red-200/60 transition-colors disabled:opacity-50"
          title="Logout from Admin Portal"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
