# SEO AND DISCOVERABILITY AUDIT: YouMarriageWeArrange
**Target System:** YouMarriageWeArrange Public Applications (`apps/web`)  
**Auditor Role:** Senior Technical SEO Specialist & Search Architecture Engineer  
**Date of Audit:** 2026-11-22  
**Status:** **CONFIRMED DEFECTS & INDEXABILITY AUDIT**

---

## 1. Executive Summary

A comprehensive Technical Search Engine Optimization (SEO) and Discoverability audit was conducted across all public routes of YouMarriageWeArrange, including the homepage, `/venues`, `/vendors`, `/venues/[slug]`, `/vendors/[slug]`, inspiration galleries, XML sitemap generation (`app/sitemap.ts`), and `robots.txt`.

### Overall SEO Posture: **CRITICAL TECHNICAL DEFECTS LIMITING INDEXABILITY**

While the root layout and inspiration hubs contain exemplary JSON-LD structured data and OpenGraph tags, the two primary revenue-generating pillars of the platform—**Venues** and **Vendors**—suffer from severe discoverability bugs:

1. **Sitemap Emits Static Mock Data Instead of Real Database Records**:
   - `apps/web/app/sitemap.ts` generates dynamic URLs by iterating over hardcoded mock arrays (`featuredVenues`, `mockVendors`, `realWeddingDetails`).
   - Every single real venue and vendor stored in the Supabase database is **completely missing from `sitemap.xml`**! Search engine crawlers relying on the sitemap will never discover real vendor/venue listings.
2. **Zero JSON-LD Structured Data on Venue and Vendor Detail Pages**:
   - Neither `/venues/[slug]` nor `/vendors/[slug]` contains JSON-LD structured data.
   - Search engines cannot identify these entities as `EventVenue`, `LocalBusiness`, or `ProfessionalService`, preventing Google Rich Snippets (star ratings, price range, review count, address).
3. **Missing Per-Venue and Per-Vendor OpenGraph Images**:
   - `generateMetadata()` in `venues/[slug]/page.tsx` and `vendors/[slug]/page.tsx` omits `openGraph.images`.
   - When couples or planners share a venue link on WhatsApp, iMessage, LinkedIn, or Twitter, the social preview falls back to the generic root layout image (`consultation_hero.png`) instead of the venue's actual photo.
4. **Missing Canonical URL Tags on Detail Pages**:
   - Detail pages omit `alternates: { canonical: ... }` in their metadata return, risking duplicate content penalties when accessed via different URL parameters.
5. **Empty Initial Server HTML on Directory Listings**:
   - `/venues` and `/vendors` rely on client-side `useEffect` data fetching. Search engine bots that do not execute client JavaScript receive an empty page with a loading spinner, severely hurting organic rankings.

---

## 2. Confirmed SEO Defect Inventory

### SEO-001 [CRITICAL]: Sitemap Generated from Mock Data Arrays
- **File:** `apps/web/app/sitemap.ts` (Lines 61–73)
- **Current Implementation:**
  ```ts
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
  ```
- **Root Cause:** Hardcoded static arrays (`featuredVenues`, `mockVendors`) were imported instead of querying the Supabase database for active venue and vendor slugs.
- **Search Engine Impact:**
  - Real venues and vendors stored in the Supabase database are 100% absent from `sitemap.xml`.
  - Google Search Console and Bing Webmaster Tools cannot crawl the live catalog via sitemap.
- **Recommended Solution:** Query Supabase for active slugs:
  ```ts
  const supabase = createPublicAnonClient();
  const [{ data: venues }, { data: vendors }] = await Promise.all([
    supabase.from("venues").select("slug, updated_at").eq("status", "Active"),
    supabase.from("vendors").select("slug, updated_at").eq("status", "Active"),
  ]);
  ```

---

### SEO-002 [HIGH]: Complete Absence of JSON-LD on Venue & Vendor Detail Pages
- **Files Affected:**
  - `apps/web/app/(public)/venues/[slug]/page.tsx`
  - `apps/web/app/(public)/vendors/[slug]/page.tsx`
- **Root Cause:** Structured data scripts (`<script type="application/ld+json">`) were added to inspiration hubs and FAQ pages, but omitted from venue and vendor detail pages.
- **Search Engine Impact:**
  - Missing Google Rich Results (Star Ratings, Review Count, Price Range `₹₹₹`, Address, Capacity).
  - Inability to appear in Google "Wedding Venues Near Me" Local 3-Pack snippets.
- **Recommended Solution:** Inject Schema.org JSON-LD in `page.tsx`:
  - For Venues: `@type: "EventVenue"` or `["EventVenue", "LocalBusiness"]` with `name`, `address`, `geo`, `image`, `priceRange`, `maximumAttendeeCapacity`, `aggregateRating`.
  - For Vendors: `@type: "LocalBusiness"` / `ProfessionalService` with `name`, `image`, `priceRange`, `telephone`, `aggregateRating`.

---

### SEO-003 [HIGH]: Missing Entity OpenGraph Social Sharing Images
- **Files Affected:**
  - `apps/web/app/(public)/venues/[slug]/page.tsx:44–66`
  - `apps/web/app/(public)/vendors/[slug]/page.tsx:60–80`
- **Root Cause:** `generateMetadata()` only defines `title` and `description`, omitting `openGraph: { images: [...] }` and `twitter: { images: [...] }`.
- **User Impact:** Social shares on WhatsApp, Telegram, Facebook, and Twitter show a generic placeholder graphic rather than the actual photograph of Taj Falaknuma Palace or the vendor's bridal portfolio, reducing social click-through rates by an estimated 60–80%.
- **Recommended Solution:** Extract the primary venue cover image and add to metadata:
  ```ts
  openGraph: {
    title: `${name} | YouMarriage Venues`,
    description: summary,
    images: [{ url: coverImageUrl, width: 1200, height: 630, alt: name }],
  }
  ```

---

### SEO-004 [MEDIUM]: Missing Canonical Tag on Detail Routes
- **Files Affected:**
  - `apps/web/app/(public)/venues/[slug]/page.tsx`
  - `apps/web/app/(public)/vendors/[slug]/page.tsx`
- **Root Cause:** `alternates: { canonical: ... }` is omitted from `generateMetadata()`.
- **Search Engine Impact:** When users or marketing campaigns link with UTM parameters (e.g. `/venues/itc-kohenur?utm_source=instagram`), search engines may index duplicate URLs rather than consolidating authority to the canonical slug.
- **Recommended Solution:** Add explicit canonical URL in `generateMetadata()`:
  ```ts
  alternates: {
    canonical: `https://www.youmarriagewearrange.com/venues/${slug}`,
  }
  ```

---

### SEO-005 [MEDIUM]: Empty Server HTML on Directory Listings
- **Files Affected:**
  - `apps/web/app/(public)/venues/page.tsx`
  - `apps/web/app/(public)/vendors/page.tsx`
- **Root Cause:** Full client-side fetching means initial HTML contains only skeletons and loaders.
- **Search Engine Impact:** Search engine spiders evaluating page content see empty directories, damaging rankings for high-value keywords like "wedding venues Hyderabad" and "wedding photographers Hyderabad".
- **Recommended Solution:** Pre-render initial page 1 catalog items on the server.

---
*Report certified by Senior Technical SEO Specialist & Search Architecture Engineer.*
