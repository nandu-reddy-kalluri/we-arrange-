import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "@/styles/globals.css";
import Navbar from "@/components/layout/Navbar/index";
import { Footer } from "@/components/layout/Footer";
import { SmoothScrollProvider } from "@/components/layout/SmoothScrollProvider";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "YouMarriageWeArrange — Premium Wedding Concierge | Hyderabad",
  description: "Hyderabad's premier wedding concierge service. Submit your requirements and our specialists personally collect, negotiate, and compare quotes from elite venues and vendors — so you don't have to.",
  keywords: [
    "wedding concierge Hyderabad",
    "wedding venues Hyderabad",
    "wedding planning Hyderabad",
    "luxury wedding Hyderabad",
    "wedding vendors Hyderabad",
    "Banjara Hills wedding venue",
    "Taj Falaknuma wedding",
  ],
  openGraph: {
    title: "YouMarriageWeArrange — Premium Wedding Concierge | Hyderabad",
    description: "Our specialists personally collect and compare quotes from Hyderabad's elite venues and vendors. No spam. No directories. Just dedicated hospitality.",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${jakarta.variable}`} data-scroll-behavior="smooth">
      <body className="antialiased bg-[hsl(30,20%,98%)] font-sans text-[hsl(240,10%,15%)] min-h-screen flex flex-col justify-between relative">
        <div className="luxury-texture-overlay" />
        <SmoothScrollProvider>
          <Navbar />
          <div className="flex-grow relative z-10">{children}</div>
          <Footer />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
