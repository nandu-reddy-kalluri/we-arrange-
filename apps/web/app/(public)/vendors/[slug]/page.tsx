import React from "react";
import type { Metadata } from "next";
import { createPublicAnonClient } from "@we-arrange/database/clients";
import { listVendorCategories } from "@we-arrange/service-vendor";
import { getCachedServerVendorDetail } from "@/services/catalog/catalogServer";
import VendorDetailsClient from "./VendorDetailsClient";
import { VendorsDirectoryClient } from "@/features/vendors/components/VendorsDirectoryClient";

interface VendorPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const CATEGORY_ALIAS_TO_UI: Record<string, string> = {
  photography: "photography",
  photographers: "photography",
  makeup: "makeup",
  "bridal-makeup": "makeup",
  decor: "decor",
  decorators: "decor",
  "decor-florists": "decor",
  mehendi: "mehendi",
  catering: "catering",
};

async function resolveCategorySlug(slug: string): Promise<string | null> {
  const lower = slug.toLowerCase();
  if (lower in CATEGORY_ALIAS_TO_UI) {
    return CATEGORY_ALIAS_TO_UI[lower];
  }
  try {
    const supabase = createPublicAnonClient();
    const categories = await listVendorCategories(supabase);
    const matched = categories.find((c) => c.slug?.toLowerCase() === lower);
    if (matched) {
      return CATEGORY_ALIAS_TO_UI[lower] ?? matched.slug;
    }
  } catch {
    // Fall back to vendor detail lookup when categories cannot be queried
  }
  return null;
}

export async function generateMetadata({ params }: VendorPageProps): Promise<Metadata> {
  const { slug } = await params;

  const matchedCategory = await resolveCategorySlug(slug);
  if (matchedCategory) {
    const formattedCategory =
      matchedCategory.charAt(0).toUpperCase() + matchedCategory.slice(1);
    return {
      title: `${formattedCategory} Artists & Services | YouMarriage Vendors`,
      description: `Find the best ${formattedCategory} vendors in Hyderabad on YouMarriage.`,
    };
  }

  const detail = await getCachedServerVendorDetail(slug);
  if (detail?.vendor) {
    const v = detail.vendor;
    const vendorName = v.name?.trim() || "Wedding Vendor";
    const city = v.city?.trim() || "Hyderabad";
    const desc =
      detail.rawDescription?.trim() ||
      v.description?.trim() ||
      `Book ${vendorName} for your wedding on YouMarriage.`;
    const primaryImage =
      v.imageUrl ||
      detail.galleryUrls[0] ||
      "/images/placeholders/photography.svg";

    return {
      title: `${city ? `${vendorName} - ${city}` : vendorName} | YouMarriage Vendors`,
      description: desc,
      openGraph: {
        title: `${vendorName} | YouMarriage Vendors`,
        description: desc,
        images: [
          {
            url: primaryImage,
            width: 1200,
            height: 630,
            alt: vendorName,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${vendorName} | YouMarriage Vendors`,
        description: desc,
        images: [primaryImage],
      },
    };
  }

  return { title: "Vendor Not Found | YouMarriage" };
}

export default async function Page({ params }: VendorPageProps) {
  const { slug } = await params;

  const matchedCategory = await resolveCategorySlug(slug);
  if (matchedCategory) {
    return <VendorsDirectoryClient defaultCategory={matchedCategory} />;
  }

  const detail = await getCachedServerVendorDetail(slug);

  // Schema.org LocalBusiness JSON-LD structured data (SEO-002)
  const jsonLd = detail
    ? {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: detail.vendor.name,
        description: detail.rawDescription || detail.vendor.description,
        url: `https://youmarriagewearrange.com/vendors/${slug}`,
        image:
          detail.galleryUrls.length > 0
            ? detail.galleryUrls
            : [detail.vendor.imageUrl],
        address: {
          "@type": "PostalAddress",
          addressLocality: detail.vendor.location || "",
          addressRegion: detail.vendor.city || "Telangana",
          addressCountry: "IN",
        },
        priceRange: detail.startingPriceInr
          ? `From ₹${detail.startingPriceInr}`
          : detail.vendor.priceStart || undefined,
        aggregateRating:
          detail.vendor.rating && detail.vendor.rating > 0
            ? {
                "@type": "AggregateRating",
                ratingValue: detail.vendor.rating,
                reviewCount: detail.vendor.reviewsCount || 1,
                bestRating: 5,
                worstRating: 1,
              }
            : undefined,
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <VendorDetailsClient slug={slug} initialData={detail} />
    </>
  );
}
