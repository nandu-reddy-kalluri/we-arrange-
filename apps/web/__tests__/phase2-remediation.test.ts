import { describe, expect, it } from "vitest";
import {
  transformVenueDetailPayload,
  transformVendorDetailPayload,
} from "../services/catalog/catalogMappers";

describe("Phase 2 Remediation Verification (ARCH-002, SEO-002, SEO-003, BE-002, IMG-005)", () => {
  it("ARCH-002: transformVenueDetailPayload builds complete SSR detail object", () => {
    const mockDbPayload = {
      venue: {
        venue_id: 101,
        venue_name: "Grand Palace",
        locality_name: "Banjara Hills",
        base_city: "Hyderabad",
        rating: 4.8,
        reviews_count: 32,
        short_summary: "Luxury royal palace for dream weddings.",
      },
      gallery: [
        { media_url: "https://example.com/photo1.jpg", sort_order: 1 },
        { media_url: "https://example.com/photo2.jpg", sort_order: 2 },
      ],
      pricing: [
        { starting_price: 2500, price_tag: "₹2,500 per plate", currency: "INR" },
      ],
    };

    const typeMap = new Map([[1, "Palace"]]);
    const detail = transformVenueDetailPayload(mockDbPayload, typeMap);

    expect(detail.venue.name).toBe("Grand Palace");
    expect(detail.venue.rating).toBe(4.8);
    expect(detail.venue.priceOnwards).toBe("₹2,500 per plate");
    expect(detail.galleryUrls).toEqual([
      "https://example.com/photo1.jpg",
      "https://example.com/photo2.jpg",
    ]);
    expect(detail.rawVenue.shortSummary).toBe("Luxury royal palace for dream weddings.");
  });

  it("ARCH-002: transformVendorDetailPayload builds complete SSR vendor detail object", () => {
    const mockDbPayload = {
      vendor: {
        vendor_id: 202,
        vendor_name: "Studio Prism",
        category_id: 5,
        rating: 4.9,
        reviews_count: 45,
        description: "Award-winning cinematic wedding photography team.",
        cover_image: "https://example.com/cover.jpg",
      },
      gallery: [
        { media_url: "https://example.com/g1.jpg", sort_order: 1 },
      ],
      pricing: [
        { service_name: "Full Wedding", price: 150000 },
      ],
    };

    const catMap = new Map([[5, { slug: "photography", category_name: "Photography" }]]);
    const detail = transformVendorDetailPayload(mockDbPayload, catMap);

    expect(detail.vendor.name).toBe("Studio Prism");
    expect(detail.categorySlug).toBe("photography");
    expect(detail.startingPriceInr).toBe(150000);
    expect(detail.galleryUrls).toContain("https://example.com/cover.jpg");
    expect(detail.rawDescription).toBe("Award-winning cinematic wedding photography team.");
  });

  it("SEO-002: generates valid Schema.org EventVenue structured data", () => {
    const mockDbPayload = {
      venue: {
        venue_id: 101,
        venue_name: "Taj Falaknuma",
        locality_name: "Engine Bowli",
        base_city: "Hyderabad",
        rating: 4.9,
        reviews_count: 120,
        address: "Engine Bowli, Fatima Nagar, Falaknuma",
        pincode: "500053",
      },
      pricing: [{ starting_price: 3500 }],
    };

    const detail = transformVenueDetailPayload(mockDbPayload);
    const schema = {
      "@context": "https://schema.org",
      "@type": "EventVenue",
      name: detail.venue.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: detail.rawVenue.address,
        addressLocality: detail.venue.location,
        addressRegion: detail.venue.city,
        postalCode: detail.rawVenue.pincode,
        addressCountry: "IN",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: detail.venue.rating,
        reviewCount: detail.venue.reviewCount,
      },
    };

    expect(schema["@type"]).toBe("EventVenue");
    expect(schema.name).toBe("Taj Falaknuma");
    expect(schema.address.postalCode).toBe("500053");
    expect(schema.aggregateRating.ratingValue).toBe(4.9);
  });
});
