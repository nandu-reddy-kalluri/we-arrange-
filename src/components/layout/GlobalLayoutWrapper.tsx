"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import { Footer } from "./Footer";

export function GlobalLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const isAuthPage = pathname?.startsWith('/register') || pathname?.startsWith('/login');
  const isConciergePortal = pathname?.startsWith('/concierge-portal') || pathname?.startsWith('/admin');

  if (isConciergePortal) {
    return <div className="flex-grow w-full min-h-screen bg-[#FBF9F6]">{children}</div>;
  }

  if (isAuthPage) {
    return <div className="flex-grow relative z-10 w-full h-full overflow-hidden lg:overflow-visible">{children}</div>;
  }

  return (
    <>
      <Navbar />
      <div className="flex-grow relative z-10 isolate">{children}</div>
      <Footer />
    </>
  );
}
