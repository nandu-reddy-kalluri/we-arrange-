import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "@/styles/globals.css";
import { GlobalLayoutWrapper } from "@/components/layout/GlobalLayoutWrapper";
import { AuthProvider } from "@/context/AuthContext";

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
  metadataBase: new URL("https://www.youmarriagewearrange.com"),
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
  alternates: {
    canonical: "https://www.youmarriagewearrange.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "YouMarriageWeArrange — Premium Wedding Concierge | Hyderabad",
    description: "Hyderabad's premier wedding concierge service. Sourcing, negotiating, and curating quotes from elite wedding venues and vendors.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://www.youmarriagewearrange.com/#website",
      "url": "https://www.youmarriagewearrange.com",
      "name": "YouMarriageWeArrange",
      "description": "Hyderabad's Premier Wedding Venue Concierge",
      "inLanguage": "en-IN"
    },
    {
      "@type": "Organization",
      "@id": "https://www.youmarriagewearrange.com/#organization",
      "name": "YouMarriageWeArrange",
      "url": "https://www.youmarriagewearrange.com",
      "logo": "https://www.youmarriagewearrange.com/images/editorial/hero_venue.png",
      "areaServed": {
        "@type": "City",
        "name": "Hyderabad",
        "addressRegion": "Telangana",
        "addressCountry": "IN"
      },
      "serviceType": "Wedding Concierge & Venue Booking"
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${jakarta.variable}`} style={{ scrollBehavior: 'smooth' }} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <AuthProvider>
          <GlobalLayoutWrapper>
            {children}
          </GlobalLayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
