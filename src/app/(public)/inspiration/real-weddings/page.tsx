import React from "react";
import { Metadata } from "next";
import { realWeddingDetails } from "@/mock-data/real-weddings";
import { RealWeddingsClient } from "./RealWeddingsClient";

export const metadata: Metadata = {
  title: "Real Wedding Stories & Inspiration | YouMarriageWeArrange",
  description: "Discover breathtaking real weddings, timeless traditions, luxury celebrations, and unforgettable love stories from across India.",
  alternates: {
    canonical: "https://www.youmarriagewearrange.com/inspiration/real-weddings"
  },
  openGraph: {
    title: "Real Wedding Stories & Inspiration | YouMarriageWeArrange",
    description: "Discover breathtaking real weddings, timeless traditions, luxury celebrations, and unforgettable love stories from across India.",
    type: "website",
    url: "https://www.youmarriagewearrange.com/inspiration/real-weddings",
    images: ["/images/editorial/hero_venue.png"]
  },
  twitter: {
    card: "summary_large_image",
    title: "Real Wedding Stories & Inspiration",
    description: "Discover breathtaking real weddings, timeless traditions, luxury celebrations, and unforgettable love stories from across India."
  }
};

export default function RealWeddingsPage() {
  const weddings = Object.values(realWeddingDetails);
  
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
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Real Weddings",
        "item": "https://www.youmarriagewearrange.com/inspiration/real-weddings"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <RealWeddingsClient weddings={weddings} />
    </>
  );
}
