import type { Metadata } from "next";
import { AuthProvider } from "@we-arrange/auth";
import CustomerShell from "./CustomerShell";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | YouMarriageWeArrange",
    default: "Customer Dashboard | YouMarriageWeArrange",
  },
  description: "Customer concierge dashboard for wedding planning and shortlist management.",
  robots: {
    index: false,
    follow: false,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export default function CustomerRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FAF9F6] text-[#2D2D2D] font-sans antialiased">
        <AuthProvider>
          <CustomerShell>{children}</CustomerShell>
        </AuthProvider>
      </body>
    </html>
  );
}
