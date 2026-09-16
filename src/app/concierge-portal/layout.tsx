"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Loader2 } from "lucide-react";

export default function ConciergePortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVerifyingSession, setIsVerifyingSession] = useState(true);
  const [isAuthenticatedInTab, setIsAuthenticatedInTab] = useState(false);

  // If on login page, render full screen without the internal sidebar/header
  const isLoginPage = pathname === "/concierge-portal/login" || pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setIsVerifyingSession(false);
      setIsAuthenticatedInTab(false);
      return;
    }

    // Verify that the user authenticated in this active browser session/visit
    const tabAuth = typeof window !== "undefined" ? sessionStorage.getItem("ymwa_admin_tab_authenticated") : null;

    if (!tabAuth) {
      // Invalidate any lingering server-side cookie and redirect to login
      fetch("/api/admin/auth/logout", { method: "POST" }).finally(() => {
        setIsVerifyingSession(false);
        router.replace("/concierge-portal/login");
      });
      return;
    }

    setIsAuthenticatedInTab(true);
    setIsVerifyingSession(false);
  }, [pathname, isLoginPage, router]);

  if (isLoginPage) {
    return <div className="min-h-screen bg-[#FBF9F6]">{children}</div>;
  }

  // Prevent flash of protected dashboard content before visit authentication is confirmed
  if (isVerifyingSession || !isAuthenticatedInTab) {
    return (
      <div className="min-h-screen bg-[#FBF9F6] flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#8B263E] to-[#C8A165] flex items-center justify-center shadow-md">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C8A165]">
            Verifying Concierge Session...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF9F6] flex flex-row">
      {/* Persistent Left Sidebar for Desktop, Collapsible for Mobile */}
      <AdminSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
