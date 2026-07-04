# Component: VendorCard

**File:** [`src/components/cards/VendorCard.tsx`](../../src/components/cards/VendorCard.tsx)
**Status:** Stable (Phase 1)

---

## Purpose

Displays a single YMWA-vetted Vendor Partner in a card format. Used in the vendor discovery section and vendor directory page.

This is the **canonical vendor card**. Do not create `VendorCardV2` or `CategoryVendorCard`.

---

## Props

```typescript
interface VendorCardProps {
  vendor: Vendor; // Imported from @/mock-data/vendors (Phase 1) → Supabase query result (Phase 1.5)
}

interface Vendor {
  id: string;
  name: string;
  slug: string;             // URL-safe identifier for routing
  category: string;         // "photographer" | "caterer" | "decorator" | "makeup_artist" | "coordinator"
  location: string;         // Format: "Area, Hyderabad"
  rating: number;           // 1.0–5.0
  priceStart: number;       // Starting price in lakhs (numeric for display)
  imageUrl: string;
}
```

---

## Variants

| Variant | How to Achieve |
|:---|:---|
| **Default** | `<VendorCard vendor={vendor} />` |
| **Category Badge** | Driven by `vendor.category` — auto-renders category chip on image |

---

## Usage

```tsx
import VendorCard from "@/components/cards/VendorCard";
import { vendors } from "@/mock-data/vendors";

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {vendors.map((vendor) => (
    <VendorCard key={vendor.id} vendor={vendor} />
  ))}
</div>
```

---

## Do's ✅

- Category badge text should use domain vocabulary from `PROJECT_GLOSSARY.md`
- The "Profile" CTA routes to `/vendors/[slug]` — ensure vendor slugs are URL-safe
- Use `loading="lazy"` on vendor images (already implemented)

## Don'ts ❌

- Do not display `priceStart` with a `$` symbol — format as `₹{priceStart}L Onwards`
- Do not add a "Lowest Rate" or "Top Rated" badge as a sorting indicator
- Do not create a separate card for vendor category grid chips — those are a different UI pattern entirely, not a VendorCard variant

---

## Known Issues (Phase 1)

- `VendorCard` currently uses raw HSL values in some class strings (`hsl(340,60%,15%)`) instead of design token classes. These should be migrated to `text-primary` and `bg-neutral-cream` equivalents in Phase 1.5.
- Price is displayed with `toLocaleString()` which may cause hydration warnings. Migrate to a deterministic formatter like `formatLakhs()`.
- The "Profile" link points to `/vendors/${vendor.slug}` which does not have a page yet (Phase 1.5).
