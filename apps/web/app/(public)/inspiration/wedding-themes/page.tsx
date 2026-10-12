import React from "react";
import { Metadata } from "next";
import { SUBSECTION_CONFIGS, SUBSECTION_ITEMS } from "@/mock-data/inspiration-subsections";
import { InspirationCategoryPageClient } from "@/features/inspiration/components/InspirationCategoryPageClient";

const config = SUBSECTION_CONFIGS["wedding-themes"];
const items = SUBSECTION_ITEMS.filter(i => i.categorySlug === "wedding-themes");

export const metadata: Metadata = {
  title: `${config.title} | YouMarriageWeArrange`,
  description: config.description,
  alternates: {
    canonical: `https://www.youmarriagewearrange.com/inspiration/wedding-themes`
  },
  openGraph: {
    title: `${config.title} | YouMarriageWeArrange`,
    description: config.description,
    type: "website",
    url: `https://www.youmarriagewearrange.com/inspiration/wedding-themes`,
    images: [config.heroImage]
  },
  twitter: {
    card: "summary_large_image",
    title: config.title,
    description: config.description
  }
};

export default function WeddingThemesPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.youmarriagewearrange.com/" },
      { "@type": "ListItem", "position": 2, "name": "Inspiration", "item": "https://www.youmarriagewearrange.com/inspiration" },
      { "@type": "ListItem", "position": 3, "name": config.title, "item": "https://www.youmarriagewearrange.com/inspiration/wedding-themes" }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <InspirationCategoryPageClient config={config} items={items} />
    </>
  );
}
