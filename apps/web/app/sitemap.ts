import type { MetadataRoute } from "next";
import { featuredVenues } from "@/mock-data/venues";

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
    { url: `${baseUrl}/invitations`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/planning`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/inspiration`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const venueRoutes: MetadataRoute.Sitemap = featuredVenues.map((venue) => ({
    url: `${baseUrl}/venues/${venue.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...venueRoutes];
}
