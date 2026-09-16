"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  FileText,
  Building2,
  Users,
  MessageSquareQuote,
  Settings,
  X,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const NAV_ITEMS = [
  { label: "Dashboard", href: "/concierge-portal", icon: LayoutDashboard },
  { label: "Analytics", href: "/concierge-portal/analytics", icon: BarChart3 },
  { label: "Pages Content", href: "/concierge-portal/pages", icon: FileText },
  { label: "Venues", href: "/concierge-portal/venues", icon: Building2 },
  { label: "Vendors", href: "/concierge-portal/vendors", icon: Users },
  { label: "Leads & Concierge", href: "/concierge-portal/leads", icon: MessageSquareQuote },
  { label: "Settings", href: "/concierge-portal/settings", icon: Settings },
];

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/concierge-portal") {
      return pathname === "/concierge-portal";
    }
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-neutral-950/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-[#FFFFFF] border-r border-[#E5E0D8] flex flex-col justify-between z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Top Branding Section */}
        <div>
          <div className="h-16 flex items-center justify-between px-6 border-b border-[#E5E0D8] bg-[#FAF9F6]">
            <Link
              href="/concierge-portal"
              className="flex items-center gap-2.5 group outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-[#8B263E] flex items-center justify-center text-white font-serif font-bold text-sm shadow-sm group-hover:bg-[#721f33] transition-colors">
                Y
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-[15px] tracking-tight text-[#8B263E]">
                  YMWA Admin
                </span>
                <span className="text-[9px] uppercase tracking-widest text-[#C8A165] font-semibold">
                  Concierge Console
                </span>
              </div>
            </Link>

            {/* Mobile close button */}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="lg:hidden text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Operations &amp; Content
            </div>

            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    active
                      ? "bg-[#FAF5ED] text-[#8B263E] border border-[#C8A165]/40 shadow-sm"
                      : "text-neutral-600 hover:bg-[#FBF9F6] hover:text-neutral-900 border border-transparent"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      active ? "text-[#8B263E]" : "text-neutral-400 group-hover:text-neutral-600"
                    }`}
                  />
                  <span>{item.label}</span>
                  {active && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#8B263E]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Security / System Badge */}
        <div className="p-4 border-t border-[#E5E0D8] bg-[#FAF9F6]">
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-[#E5E0D8]">
            <ShieldCheck className="w-4 h-4 text-[#C8A165] shrink-0" />
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-neutral-800">
                Phase 1 Admin Mode
              </span>
              <span className="text-[9px] text-neutral-500">
                Single Account Security
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
