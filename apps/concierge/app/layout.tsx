import React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { ConciergePortalShell } from "./ConciergePortalShell";

export const metadata: Metadata = {
  title: "Concierge Portal | YouMarriage",
  description: "Internal Concierge Control Center",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FBF9F6] font-sans antialiased">
        <ConciergePortalShell>{children}</ConciergePortalShell>
      </body>
    </html>
  );
}
