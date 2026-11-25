import { describe, expect, it, vi, beforeEach } from "vitest";

const mockFrom = vi.fn();

vi.mock("@we-arrange/database/clients", () => ({
  createPublicAnonClient: () => ({
    from: mockFrom,
  }),
}));

import sitemap from "@/app/sitemap";
import { featuredVenues } from "@/mock-data/venues";
import { mockVendors } from "@/mock-data/vendors";

describe("SEO-001: Dynamic sitemap generation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("queries active venues and vendors from Supabase and formats entries correctly", async () => {
    const venueUpdated = "2026-11-20T10:00:00.000Z";
    const vendorUpdated = "2026-11-21T12:00:00.000Z";

    mockFrom.mockImplementation((table: string) => {
      if (table === "venues") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: [
                  { slug: "taj-falaknuma-palace", updated_at: venueUpdated },
                  { slug: "ramoji-film-city", updated_at: null },
                ],
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === "vendors") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: [
                  { slug: "stories-by-joseph-radhik", updated_at: vendorUpdated },
                ],
                error: null,
              }),
            }),
          }),
        };
      }
      return { select: vi.fn() };
    });

    const entries = await sitemap();

    // Check URLs present
    const urls = entries.map((e) => e.url);
    expect(urls).toContain("https://www.youmarriagewearrange.com/venues/taj-falaknuma-palace");
    expect(urls).toContain("https://www.youmarriagewearrange.com/venues/ramoji-film-city");
    expect(urls).toContain("https://www.youmarriagewearrange.com/vendors/stories-by-joseph-radhik");

    // Check metadata fields
    const tajEntry = entries.find((e) => e.url.endsWith("/venues/taj-falaknuma-palace"));
    expect(tajEntry).toBeDefined();
    expect(tajEntry?.changeFrequency).toBe("weekly");
    expect(tajEntry?.priority).toBe(0.8);
    expect(tajEntry?.lastModified).toEqual(new Date(venueUpdated));

    const vendorEntry = entries.find((e) => e.url.endsWith("/vendors/stories-by-joseph-radhik"));
    expect(vendorEntry).toBeDefined();
    expect(vendorEntry?.changeFrequency).toBe("weekly");
    expect(vendorEntry?.priority).toBe(0.8);
    expect(vendorEntry?.lastModified).toEqual(new Date(vendorUpdated));

    // Static routes preserved
    expect(urls).toContain("https://www.youmarriagewearrange.com");
    expect(urls).toContain("https://www.youmarriagewearrange.com/venues");
    expect(urls).toContain("https://www.youmarriagewearrange.com/vendors");
    expect(urls).toContain("https://www.youmarriagewearrange.com/vendors/photography");
    expect(urls).toContain("https://www.youmarriagewearrange.com/inspiration/real-weddings");
  });

  it("falls back to static mock arrays if database queries fail or return empty", async () => {
    mockFrom.mockImplementation(() => {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            limit: vi.fn().mockRejectedValue(new Error("Database offline")),
          }),
        }),
      };
    });

    const entries = await sitemap();
    const urls = entries.map((e) => e.url);

    // Fallback venues and vendors present
    expect(urls).toContain(`https://www.youmarriagewearrange.com/venues/${featuredVenues[0].slug}`);
    expect(urls).toContain(`https://www.youmarriagewearrange.com/vendors/${mockVendors[0].slug}`);
  });
});
