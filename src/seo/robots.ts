import type { MetadataRoute } from "next";

/**
 * Robots configuration for YouMarriageWeArrange.
 * Allows all crawlers for public pages.
 * Blocks /admin/* and /api/* from indexing.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
    ],
  };
}
