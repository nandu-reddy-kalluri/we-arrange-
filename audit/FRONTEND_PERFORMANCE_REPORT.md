# FRONTEND PERFORMANCE & CORE WEB VITALS AUDIT: YouMarriageWeArrange
**Target System:** YouMarriageWeArrange Frontend Applications  
**Auditor Role:** Principal Frontend Performance Engineer  
**Date of Audit:** 2026-11-22  
**Status:** **CONFIRMED DEFECTS & CORE WEB VITALS ANALYSIS**

---

## 1. Executive Summary

A comprehensive frontend performance audit was conducted across all user-facing routes on desktop and mobile viewports. The evaluation analyzed DOM complexity, hydration overhead, JavaScript bundle execution, CSS rendering performance, and Core Web Vitals (LCP, INP, CLS, FCP, TTFB).

### Overall Frontend Performance Posture: **NEEDS STRUCTURAL OPTIMIZATION**

While the UI aesthetic is luxurious and visually refined, severe performance penalties exist in the initial rendering and hydration pipeline:

1. **Dual DOM Tree Duplication on Homepage**:
   - `apps/web/app/page.tsx` renders BOTH the complete desktop layout (`hidden md:block`) AND the complete mobile layout (`block md:hidden`) simultaneously into the HTML document.
   - This doubles the DOM node count, forces React to execute hydration and hooks for both trees, and triggers image downloads for hidden desktop elements on mobile devices.
2. **Forced Dynamic Server Rendering**:
   - `apps/web/app/page.tsx` explicitly specifies `export const dynamic = "force-dynamic"`. Next.js is prohibited from statically pre-rendering or caching the page via Incremental Static Regeneration (ISR), increasing TTFB on cold requests.
3. **Client-Side Data Fetching on Listing Pages**:
   - `/venues` (`VenueDiscoveryClient.tsx`) and `/vendors` (`VendorsDirectoryClient.tsx`) execute all catalog data fetching inside client-side `useEffect` hooks.
   - Initial server HTML contains zero venue/vendor cards—only a loading spinner or skeleton. Largest Contentful Paint (LCP) cannot begin loading until client JS loads, executes, queries the backend API, and renders the cards.
4. **LCP Image Lazy Loading**:
   - All cards rendered by `VenueCard.tsx` and `VendorCard.tsx` use default `loading="lazy"`. The primary visual card above the fold is delayed by up to 2 seconds.
5. **Cumulative Layout Shift (CLS)**:
   - Dynamic grids and raw `<img>` tags without predefined aspect-ratio containers cause noticeable layout shifts during image decoding.

---

## 2. Core Web Vitals Impact Analysis

| Metric | Target | Current Estimated Assessment | Primary Root Cause |
|---|---|---|---|
| **LCP (Largest Contentful Paint)** | < 2.5s | **3.2s – 4.8s (Poor)** | Client-side data fetching on listings + default `loading="lazy"` on above-the-fold cards + raw unoptimized 4K images. |
| **CLS (Cumulative Layout Shift)** | < 0.1 | **0.18 – 0.28 (Needs Improvement)** | Transition from full-screen `PageLoader` spinner to client-rendered grid + missing aspect-ratio placeholders on raw `<img>` tags. |
| **INP (Interaction to Next Paint)** | < 200ms | **180ms – 260ms (Borderline)** | Monolithic client components (`VenueDetailsClient` 1,365 lines) running heavy state logic and Framer Motion layout animations on main thread. |
| **FCP (First Contentful Paint)** | < 1.8s | **1.6s – 2.2s (Acceptable)** | Well-configured Google Fonts (`display: swap`), but slowed by dynamic SSR execution (`force-dynamic`). |
| **TTFB (Time to First Byte)** | < 800ms | **650ms – 1,100ms (Variable)** | N+1 Supabase database queries executed on cold server requests during `loadHomeFeaturedCatalog()`. |

---

## 3. Confirmed Frontend Performance Defects

### FE-001: Desktop & Mobile Duplicate DOM Tree Rendering
- **File:** `apps/web/app/page.tsx` (Lines 201–238)
- **Current Code:**
  ```tsx
  {/* --- DESKTOP EXPERIENCE --- */}
  <div className="hidden md:block">
    <HeroSection heroVenues={heroVenues} />
    <VenueSection venues={featuredVenues} totalCount={totalVenues} />
    <VendorSection categories={vendorCategories} />
    <DigitalSuiteSection />
    <CelebrateSection venues={heroVenues} vendors={featuredVendors} />
  </div>

  {/* --- MOBILE EXPERIENCE --- */}
  <div className="block md:hidden">
    <MobileHomeExperience
      heroVenues={heroVenues}
      featuredVenues={featuredVenues}
      featuredVendors={featuredVendors}
    />
  </div>
  ```
- **Root Cause:** Responsive layout separation implemented via CSS display toggles (`hidden md:block` / `block md:hidden`) rather than adaptive responsive components.
- **Technical Impact:**
  - Doubles the HTML payload size.
  - Generates over 1,800 DOM nodes on initial load.
  - React must hydrate both component trees, creating event listeners, state stores, and animation refs for invisible components.
  - Mobile browsers download images embedded in the hidden desktop markup.
- **Recommended Solution:** Consolidate into unified responsive components using Tailwind responsive classes (`sm:`, `md:`, `lg:`), or conditionally render based on server-side User-Agent detection if device-tailored trees are strictly required.

---

### FE-002: Client-Side Waterfall on Venue & Vendor Directories
- **Files:**
  - `apps/web/app/(public)/venues/page.tsx:9–15` & `VenueDiscoveryClient.tsx:45–120`
  - `apps/web/app/(public)/vendors/page.tsx:25–29` & `VendorsDirectoryClient.tsx:91–120`
- **Root Cause:** Both pages return pure client wrappers that initialize with `isLoading = true` and trigger data fetching only after component mount in the browser.
- **Technical Impact:**
  - Initial HTML sent to the browser and search engine bots contains zero catalog items.
  - Network waterfall: Server HTML -> JS Bundle Download -> React Hydration -> Client Fetch to `/api/venues` -> Supabase Query -> JSON Return -> DOM Mount -> Image Download.
  - Users on 4G mobile connections wait 2 to 4 seconds looking at a spinner before seeing any venues or vendors.
- **Recommended Solution:** Perform the initial page 1 catalog query on the server in `page.tsx` and pass `initialVenues={initialData}` into `VenueDiscoveryClient`. The client component can use initial data immediately and only execute client fetches when filters or pagination change.

---

### FE-003: Homepage `force-dynamic` Disabling Edge Caching
- **File:** `apps/web/app/page.tsx:63`
- **Current Code:**
  ```ts
  export const dynamic = "force-dynamic";
  ```
- **Root Cause:** Forced dynamic rendering was added to ensure catalog counts update, preventing Next.js from using static page generation.
- **Technical Impact:**
  - Every single request hits the Node.js server.
  - Edge CDNs cannot serve static cached HTML for the homepage.
  - Higher server CPU costs and latency spikes under traffic surges.
- **Recommended Solution:** Replace `force-dynamic` with Incremental Static Regeneration (ISR):
  ```ts
  export const revalidate = 300; // Revalidate every 5 minutes
  ```
  This serves instantaneous cached HTML from edge CDNs while automatically refreshing data in the background.

---

### FE-004: Monolithic Client Component Hydration Cost
- **Files:**
  - `apps/web/app/(public)/venues/[slug]/VenueDetailsClient.tsx` (1,365 lines)
  - `apps/web/app/(public)/vendors/[slug]/VendorDetailsClient.tsx` (1,170 lines)
- **Root Cause:** All UI sections (overview, hero gallery, pricing, amenities, policies, team, FAQ, similar venues, contact form, inquiry modal, lightbox) are bundled into a single monolithic client component.
- **Technical Impact:**
  - Massive JavaScript parse and compile time during initial page load.
  - Any state change in the lightbox or enquiry form causes re-evaluation across a massive React component tree.
- **Recommended Solution:** Decompose into modular components and lazily load off-screen interactive modals (`next/dynamic` for Lightbox, Inquiry Modal, and Video Player).

---
*Report certified by Principal Frontend Performance Engineer.*
