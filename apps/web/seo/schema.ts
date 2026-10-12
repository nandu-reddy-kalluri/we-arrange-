/**
 * JSON-LD Structured Data schemas for YouMarriageWeArrange.
 * Phase 1: Organization schema for the root page.
 * Phase 1.5: LocalBusiness + AggregateRating for venue detail pages.
 *
 * Usage:
 *   import { organizationSchema } from "@/seo/schema";
 *   In your layout/page add a <script> tag with JSON.stringify(organizationSchema)
 */

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "YouMarriageWeArrange",
  description: "Premium wedding concierge service in Hyderabad.",
  url: "https://youmarriagewearrange.com",
  areaServed: {
    "@type": "City",
    name: "Hyderabad",
    addressRegion: "Telangana",
    addressCountry: "IN",
  },
  serviceType: "Wedding Concierge",
};
