import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { SUBSECTION_ITEMS } from "@/mock-data/inspiration-subsections";
import { InspirationDetailPageClient } from "@/features/inspiration/components/InspirationDetailPageClient";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = SUBSECTION_ITEMS.find(i => i.categorySlug === "wedding-themes" && i.slug === slug);
  if (!item) return {};

  return {
    title: `${item.title} - Wedding Themes | YouMarriageWeArrange`,
    description: item.shortDescription,
    alternates: {
      canonical: `https://www.youmarriagewearrange.com/inspiration/wedding-themes/${item.slug}`
    },
    openGraph: {
      title: item.title,
      description: item.shortDescription,
      images: [item.heroImage]
    },
    twitter: {
      card: "summary_large_image",
      title: item.title,
      description: item.shortDescription
    }
  };
}

export default async function WeddingThemesDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = SUBSECTION_ITEMS.find(i => i.categorySlug === "wedding-themes" && i.slug === slug);

  if (!item) {
    notFound();
  }

  const relatedItems = SUBSECTION_ITEMS.filter(i => i.categorySlug === "wedding-themes" && i.slug !== item.slug).slice(0, 4);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": item.title,
    "description": item.shortDescription,
    "image": [item.heroImage],
    "author": {
      "@type": "Organization",
      "name": "YouMarriageWeArrange"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <InspirationDetailPageClient item={item} relatedItems={relatedItems} />
    </>
  );
}
