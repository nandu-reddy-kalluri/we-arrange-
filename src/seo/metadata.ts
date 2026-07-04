import type { Metadata } from "next";

/**
 * Generates page-specific metadata for YMWA routes.
 * Usage: export const metadata = generatePageMetadata({ title: "Venues", description: "..." });
 * Phase 1: Static metadata only.
 * Phase 1.5: Dynamic metadata via generateMetadata() for venue/vendor detail pages.
 */
export function generatePageMetadata(overrides: Partial<Metadata>): Metadata {
  return {
    title: overrides.title
      ? `${overrides.title} | YouMarriageWeArrange`
      : "YouMarriageWeArrange - Premium Wedding Concierge | Hyderabad",
    description:
      overrides.description ??
      "Hyderabad's premier wedding concierge service. Our specialists personally collect and compare quotes from elite venues and vendors.",
    ...overrides,
  };
}
