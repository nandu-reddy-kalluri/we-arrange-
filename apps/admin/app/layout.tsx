import React from "react";
import "./globals.css";

export const metadata = {
  title: "WeArrange Admin Portal",
  description: "Internal administrative control and management console",
};

export default function AdminRootLayout({
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
