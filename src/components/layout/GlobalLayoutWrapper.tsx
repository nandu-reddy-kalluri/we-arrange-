"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import { Footer } from "./Footer";

export function GlobalLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const isAuthPage = pathname?.startsWith('/register') || pathname?.startsWith('/login');

  if (isAuthPage) {
    return <div className="flex-grow relative z-10 w-full h-full">{children}</div>;
  }

  return (
    <>
      <Navbar />
      <div className="flex-grow relative z-10 isolate">{children}</div>
      <Footer />
    </>
  );
}
