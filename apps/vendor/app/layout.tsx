import type { Metadata } from "next";
import { AuthProvider } from "@we-arrange/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "WeArrange Vendor Portal",
  description: "Vendor profile, enquiry management, and booking dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export default function VendorRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
