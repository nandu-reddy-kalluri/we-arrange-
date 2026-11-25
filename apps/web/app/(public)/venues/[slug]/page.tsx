import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCachedServerVenueDetail } from "@/services/catalog/catalogServer";
import VenueDetailsClient from "./VenueDetailsClient";

interface VenuePageProps {
  params: Promise<{
    slug: string;
  }>;
}

const VENUE_CATEGORY_ALIASES: Record<string, string> = {
  luxury: "/venues?venueType=Palace",
  destination: "/venues?venueType=Resort",
  hotels: "/venues?venueType=Hotel",
  hotel: "/venues?venueType=Hotel",
  resorts: "/venues?venueType=Resort",
  resort: "/venues?venueType=Resort",
  farmhouses: "/venues?venueType=Farmhouse",
  farmhouse: "/venues?venueType=Farmhouse",
  "banquet-halls": "/venues?venueType=Banquet+Hall",
  "banquet-hall": "/venues?venueType=Banquet+Hall",
  palace: "/venues?venueType=Palace",
  palaces: "/venues?venueType=Palace",
  royal: "/venues?search=Royal",
  garden: "/venues?space=Outdoor",
  beach: "/venues?venueType=Resort",
  modern: "/venues?venueType=Hotel",
  heritage: "/venues?venueType=Palace",
};

export async function generateMetadata({ params }: VenuePageProps): Promise<Metadata> {
  const { slug } = await params;
  const alias = VENUE_CATEGORY_ALIASES[slug.toLowerCase()];
  if (alias) {
    return {
      title: `${slug.charAt(0).toUpperCase() + slug.slice(1)} Wedding Venues | YouMarriage`,
      description: `Explore curated ${slug} wedding venues in Hyderabad on YouMarriage.`,
    };
  }

  const detail = await getCachedServerVenueDetail(slug);
  if (detail?.venue) {
    const v = detail.venue;
    const name = v.name?.trim() || "Wedding Venue";
    const city = v.city?.trim() || "Hyderabad";
    const summary =
      detail.rawVenue?.shortSummary?.trim() ||
      detail.rawVenue?.description?.trim() ||
      detail.rawVenue?.aboutVenue?.trim() ||
      v.venueHighlights?.join(", ") ||
      `Explore ${name} on YouMarriage.`;
    const primaryImage = v.imageUrl || detail.galleryUrls[0] || "/images/placeholders/venue.svg";

    return {
      title: `${city ? `${name} - ${city}` : name} | YouMarriage Venues`,
      description: summary,
      openGraph: {
        title: `${name} | YouMarriage Venues`,
        description: summary,
        images: [
          {
            url: primaryImage,
            width: 1200,
            height: 630,
            alt: name,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `${name} | YouMarriage Venues`,
        description: summary,
        images: [primaryImage],
      },
    };
  }

  return { title: "Venue Not Found | YouMarriage" };
}

export default async function Page({ params }: VenuePageProps) {
  const { slug } = await params;
  const alias = VENUE_CATEGORY_ALIASES[slug.toLowerCase()];
  if (alias) {
    redirect(alias);
  }

  const detail = await getCachedServerVenueDetail(slug);

  // Schema.org EventVenue JSON-LD structured data (SEO-002)
  const jsonLd = detail
    ? {
        "@context": "https://schema.org",
        "@type": "EventVenue",
        name: detail.venue.name,
        description:
          detail.rawVenue?.shortSummary ||
          detail.rawVenue?.description ||
          detail.venue.venueHighlights?.join(", ") ||
          detail.venue.name,
        url: `https://youmarriagewearrange.com/venues/${slug}`,
        image:
          detail.galleryUrls.length > 0 ? detail.galleryUrls : [detail.venue.imageUrl],
        address: {
          "@type": "PostalAddress",
          streetAddress: detail.rawVenue?.address || detail.venue.location || "",
          addressLocality: detail.venue.location || "",
          addressRegion: detail.venue.city || "Telangana",
          postalCode: detail.rawVenue?.pincode || "",
          addressCountry: "IN",
        },
        maximumAttendeeCapacity: detail.venue.maxCapacity || undefined,
        priceRange:
          detail.venue.priceOnwards ||
          (detail.venue.pricePerPlate
            ? `₹${detail.venue.pricePerPlate} per plate`
            : undefined),
        aggregateRating:
          detail.venue.rating && detail.venue.rating > 0
            ? {
                "@type": "AggregateRating",
                ratingValue: detail.venue.rating,
                reviewCount: detail.venue.reviewCount || 1,
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
      <VenueDetailsClient slug={slug} initialData={detail} />
    </>
  );
}
