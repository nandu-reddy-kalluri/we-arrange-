import type { Metadata } from "next";
import { AuthProvider } from "@we-arrange/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "WeArrange Admin Portal",
  description: "Internal administrative control and management console",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FAF7F3] text-[#2D2D2D] font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
