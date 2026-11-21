import type { MetadataRoute } from "next";
import { featuredVenues } from "@/mock-data/venues";
import { mockVendors } from "@/mock-data/vendors";
import { realWeddingDetails } from "@/mock-data/real-weddings";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.youmarriagewearrange.com";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/venues`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/vendors`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/wedding-studio`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/digital-suite`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/e-invites`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/planning`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/planning/budget`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/planning/checklist`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/planning/guests`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/planning/timeline`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/planning/shortlist`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/planning/invitations`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/planning/saved-inspirations`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/wedding-studio/einvites`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/wedding-studio/einvites/templates`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/wedding-studio/websites`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/wedding-studio/websites/templates`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/inspiration`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/inspiration/real-weddings`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/inspiration/bridal-wear`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/inspiration/groom-wear`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/inspiration/decor`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/inspiration/wedding-themes`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/inspiration/color-palettes`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/inspiration/invitations`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/inspiration/jewellery`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/inspiration/makeup`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/inspiration/hairstyles`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/inspiration/photography`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const vendorCategoryRoutes: MetadataRoute.Sitemap = [
    "photography",
    "decor",
    "makeup",
    "mehendi",
    "catering",
  ].map((cat) => ({
    url: `${baseUrl}/vendors/${cat}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  const venueRoutes: MetadataRoute.Sitemap = featuredVenues.map((venue) => ({
    url: `${baseUrl}/venues/${venue.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const vendorRoutes: MetadataRoute.Sitemap = mockVendors.map((vendor) => ({
    url: `${baseUrl}/vendors/${vendor.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const realWeddingRoutes: MetadataRoute.Sitemap = Object.keys(realWeddingDetails).map((slug) => ({
    url: `${baseUrl}/inspiration/real-weddings/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  return [
    ...staticRoutes,
    ...vendorCategoryRoutes,
    ...venueRoutes,
    ...vendorRoutes,
    ...realWeddingRoutes,
  ];
}
