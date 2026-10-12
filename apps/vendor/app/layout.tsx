import React from "react";
import "./globals.css";

export const metadata = {
  title: "WeArrange Vendor Portal",
  description: "Vendor profile, enquiry management, and booking dashboard",
};

export default function VendorRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
