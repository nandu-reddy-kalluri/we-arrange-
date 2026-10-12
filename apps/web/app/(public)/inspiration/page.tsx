import React from "react";
import { Metadata } from "next";
import dynamic from "next/dynamic";

const InspirationClientPage = dynamic(
  () => import("@/features/inspiration/components/InspirationClientPage").then((mod) => mod.InspirationClientPage),
  { ssr: true }
);
export const metadata: Metadata = {
  title: "Wedding Themes & Decor Inspiration | YouMarriageWeArrange",
  description: "Explore our curated collection of luxury wedding themes and premium decor inspirations in Hyderabad. Discover palace, garden, and beach wedding ideas, mandap designs, floral layouts, and more.",
  keywords: [
    "wedding inspiration",
    "wedding themes",
    "wedding decor",
    "mandap designs Hyderabad",
    "palace wedding ideas",
    "luxury wedding styling",
  ],
  alternates: {
    canonical: "https://www.youmarriagewearrange.com/inspiration"
  },
  openGraph: {
    title: "Wedding Themes & Decor Inspiration | YouMarriageWeArrange",
    description: "Discover curated themes, stunning decor layouts, and styling ideas for your luxury wedding celebration.",
    type: "website",
    url: "https://www.youmarriagewearrange.com/inspiration",
    images: ["/images/editorial/royal_wedding.png"]
  },
  twitter: {
    card: "summary_large_image",
    title: "Wedding Themes & Decor Inspiration",
    description: "Discover curated themes, stunning decor layouts, and styling ideas for your luxury wedding celebration."
  }
};

export default function InspirationPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.youmarriagewearrange.com/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Inspiration",
        "item": "https://www.youmarriagewearrange.com/inspiration"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <main>
        <InspirationClientPage />
      </main>
    </>
  );
}
