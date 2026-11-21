# YMWA — Dynamic Expandable Image Gallery Implementation Report

**Project:** YouMarriageWeArrange (YMWA)  
**Deliverable:** Reusable `DynamicGridGallery` Component & Integrations across Venue and Wedding Detail Pages  
**Date:** November 20, 2026  
**Status:** Complete & Verified  

---

## 1. Executive Summary

We have successfully implemented the interactive **Dynamic Grid Gallery** with 500ms cubic-bezier hover expansion across both **Venue Detail Pages** (including `/venues/itc-kohenur`) and **Real Wedding Detail Pages** (including `/inspiration/real-weddings/[slug]`).

The implementation adheres to the YMWA design system (Imperial maroon `#8B263E`, Warm gold `#C8A165`, Charcoal `#2D2D2D`, rounded-[22px] corners) and delivers:
- Multi-dimensional hover expansion: active image row and column expand smoothly at an expansion factor of `1.85fr` while neighbors transition to `0.9fr` / `0.85fr`.
- Adaptive layouts for variable image counts (1, 2, 3, 4, 5, and 6+ images) without blank holes or broken cells.
- 5-item luxury showcase layout matching the ITC Kohenur reference (1 primary left hero spanning 2 rows + 4 showcase tiles in a 2×2 grid).
- Touch stability for mobile and tablets (disabling hover distortion on coarse pointers to eliminate accidental layout shifts).
- Preserved fullscreen Lightbox modal with keyboard arrow navigation, swipe gestures, thumbnail scroller, and "View All Photos" trigger.
- Next.js performance optimizations (eager loading for above-the-fold images, lazy loading for remaining, CLS prevention, and error fallbacks).

---

## 2. Component Architecture & File Locations

| File | Type | Purpose |
|---|---|---|
| `apps/web/components/ui/DynamicGridGallery.tsx` | Client Component | Main reusable interactive gallery component with hover expansion, image error fallbacks, and floating "View All Photos" badge |
| `apps/web/components/ui/dynamicGalleryData.ts` | Data & Logic Module | Grid template mathematical calculations, data normalization, default items, and fallback constants |
| `apps/web/app/(public)/venues/[slug]/VenueDetailsClient.tsx` | Page Client Component | Integrated `DynamicGridGallery` into the venue hero container for ITC Kohenur and all venue detail pages |
| `apps/web/app/(public)/inspiration/real-weddings/[slug]/RealWeddingGallery.tsx` | Feature Client Component | Interactive wedding album gallery with `DynamicGridGallery` + Fullscreen Lightbox Modal |
| `apps/web/app/(public)/inspiration/real-weddings/[slug]/page.tsx` | Route Page | Connected `RealWeddingGallery` to real wedding story details |
| `apps/web/__tests__/dynamic-grid-gallery.test.ts` | Test Suite | 5 comprehensive unit tests covering variable image counts, mobile touch safeguards, and wedding data normalization |

---

## 3. Visual & Interactive Behavior

### 3.1 Grid Matrix by Image Count

1. **1 Image:**
   - Single cell (`1fr × 1fr`).
   - Full container coverage with subtle hover zoom and vignette.
2. **2 Images:**
   - 2 columns (`1fr 1fr`), 1 row.
   - Hovering column 0 expands to `1.85fr 0.9fr`; hovering column 1 expands to `0.9fr 1.85fr`.
3. **3 Images:**
   - 3 columns (`1fr 1fr 1fr`), 1 row.
   - Hovering column `c` expands active column to `1.85fr`, neighbors `0.9fr`.
4. **4 Images:**
   - 2 columns × 2 rows (`1fr 1fr` columns, `1fr 1fr` rows).
   - Hovering cell `(r, c)` expands row `r` to `1.85fr` and column `c` to `1.85fr`.
5. **5 Images (Luxury Showcase / ITC Kohenur Model):**
   - 3 columns × 2 rows.
   - Item 0 (Hero): Spans row 1 and row 2 in Column 1 (`row-span-2 col-start-1 row-start-1`).
   - Items 1 & 2: Top row, Columns 2 & 3.
   - Items 3 & 4: Bottom row, Columns 2 & 3.
   - When Item 0 is hovered: Column 1 expands to `2.31fr` while Columns 2 & 3 shrink to `0.85fr`.
   - When Items 1–4 are hovered: Their active row and column expand smoothly to `1.85fr`.
6. **6 or More Images:**
   - 3 columns × 2 rows. First 6 images displayed in interactive grid.
   - Hovering any item expands its specific row and column in 500ms.
   - Floating badge: `View All Photos ({totalCount})` gives one-click access to the full lightbox.

### 3.2 Transition Specification
```css
transition: grid-template-columns 500ms cubic-bezier(0.25, 1, 0.5, 1),
            grid-template-rows 500ms cubic-bezier(0.25, 1, 0.5, 1);
```
- Image zoom: `transition-transform duration-700 ease-out group-hover:scale-105`
- Ambient vignette: `bg-gradient-to-t from-black/35 via-transparent to-black/10` (softens to 15% opacity on active hover)
- Indicator badge: Pill in bottom-left corner with `Expand Photo` on hover.

---

## 4. Mobile & Touch Safeguards

- **Device Query:** Detects `(pointer: coarse)` and touch capabilities via `navigator.maxTouchPoints`.
- **Layout Shift Prevention:** Disables cursor distortion on touch/mobile devices so user scrolling does not accidentally trigger 500ms row/column resizes.
- **Direct Tap Action:** Tapping any photo cell on mobile opens the fullscreen interactive lightbox directly at that photo index.
- **Touch Gestures:** Lightbox supports horizontal swipe gestures with delta thresholds (`Math.abs(deltaX) > 40px`) to navigate previous and next photographs.

---

## 5. Performance & Asset Optimizations

1. **LCP & Eager Loading:**
   - The primary hero and first companion image (`index < 2`) specify `loading="eager"` and `decoding="async"` for rapid First Contentful Paint.
2. **Lazy Loading:**
   - Items 3 through 6 use `loading="lazy"`.
3. **Graceful Error Fallback:**
   - Individual image cells track load failures via `onError`. If a third-party CDN or broken URL fails, it automatically degrades to `DEFAULT_VENUE_IMAGE` or `DEFAULT_FALLBACK_IMAGE` without collapsing the grid.
4. **Reserved Layout Dimensions:**
   - Gallery container maintains `h-[300px] sm:h-[380px] md:h-[450px]` (aspect-ratio bounded), eliminating Cumulative Layout Shift (CLS).

---

## 6. Verification & Test Suite Results

### 6.1 Unit Test Suite (`vitest run`)
- **Suite:** `apps/web/__tests__/dynamic-grid-gallery.test.ts`
  - `provides valid default gallery items structure` -> **PASSED**
  - `handles variable image counts safely (1, 2, 3, 4, 5, 6+ images) without breaking` -> **PASSED**
  - `disables dynamic distortion on mobile touch devices to prevent layout jumps` -> **PASSED**
  - `integrates seamlessly with real wedding gallery media data` -> **PASSED**
  - `gracefully falls back on empty or undefined items without throwing` -> **PASSED**
- **Overall Vitest Result:** **18 test suites passed, 138 unit tests passed, 4 integration tests skipped (142 total)**. Zero failures.

### 6.2 TypeScript Compilation (`turbo typecheck`)
- **Packages Checked:** 6/6 (`@we-arrange/database`, `web`, `customer`, `vendor`, `admin`, `concierge`).
- **Result:** **6 successful, 0 errors**.

### 6.3 Production Build (`pnpm --filter web build`)
- **Result:** Compiled successfully in 33.2s.
- **Route generation:** **138/138 static and dynamic routes** generated without errors.
- **Key verified routes:**
  - `ƒ /venues/[slug]` (10.6 kB)
  - `ƒ /inspiration/real-weddings/[slug]` (5.54 kB)

---

## 7. Pages to Inspect

- **ITC Kohenur Venue Gallery:** `http://localhost:3000/venues/itc-kohenur`
- **Taj Falaknuma Palace Venue Gallery:** `http://localhost:3000/venues/taj-falaknuma-palace`
- **Fort Grand Venue Gallery:** `http://localhost:3000/venues/fort-grand`
- **Real Wedding Detail Gallery 1:** `http://localhost:3000/inspiration/real-weddings/elegant-city-affair`
- **Real Wedding Detail Gallery 2:** `http://localhost:3000/inspiration/real-weddings/sun-kissed-goa-wedding`
- **Real Wedding Detail Gallery 3:** `http://localhost:3000/inspiration/real-weddings/heritage-hyderabad-nikah`
