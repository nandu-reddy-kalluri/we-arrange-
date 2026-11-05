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
};

export default function CustomerRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CustomerShell>{children}</CustomerShell>
        </AuthProvider>
      </body>
    </html>
  );
}
