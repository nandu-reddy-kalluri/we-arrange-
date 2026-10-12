import type { MetadataRoute } from "next";

/**
 * Sitemap for YouMarriageWeArrange.
 * Phase 1: Static public routes only.
 * Phase 1.5: Add dynamic venue/vendor routes from Supabase.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://youmarriagewearrange.com";

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/venues`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/vendors`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];
}
