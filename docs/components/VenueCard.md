# Component: VenueCard

**File:** [`src/components/cards/VenueCard.tsx`](../../src/components/cards/VenueCard.tsx)
**Status:** Stable (Phase 1)

---

## Purpose

Displays a single YMWA-vetted Venue Partner in a premium card format. Used in the venue grid on the landing page and the venue discovery page.

This is the **canonical venue card**. Do not create `VenueCardV2`, `VenueCardNew`, or `HomeVenueCard`. If you need a variation, extend this component via props.

---

## Props

```typescript
interface VenueCardProps {
  venue: Venue; // Imported from @/mock-data/venues (Phase 1) → Supabase query result (Phase 1.5)
}

interface Venue {
  id: string;
  name: string;
  location: string;          // Format: "Area, Hyderabad"
  rating: number;            // 1.0–5.0, concierge-curated editorial rating
  priceOnwards: string;      // Format: "₹XL Onwards"
  capacityRange: string;     // Format: "200 - 1,200 Guests"
  imageUrl: string;          // Optimised image URL
  isPopular: boolean;        // Manually curated "Popular Choice" badge
}
```

---

## Variants

| Variant | How to Achieve | Use Case |
|:---|:---|:---|
| **Default** | `<VenueCard venue={venue} />` | Standard venue grid |
| **Popular** | Set `venue.isPopular = true` | Shows "Popular Choice" badge |
| **Liked** | Internal state `liked` (heart toggle) | Shortlist interaction |

There is no separate component for each variant. All variants are handled via props and internal state.

---

## Usage

```tsx
import VenueCard from "@/components/cards/VenueCard";
import { venues } from "@/mock-data/venues";

// In a grid:
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  {venues.map((venue) => (
    <VenueCard key={venue.id} venue={venue} />
  ))}
</div>
```

---

## Do's ✅

- Pass the full `Venue` object — do not destructure individual fields as separate props
- Use `loading="lazy"` on venue images (already implemented in the component)
- Wrap VenueCard grids in `overflow-hidden` containers on mobile to allow card snapping
- Let the card handle its own shortlist heart toggle (internal state)

## Don'ts ❌

- Do not create a new card component for a "venue card with a different layout" — extend via props
- Do not hardcode venue data inside the component — always pass via `venue` prop
- Do not add price sorting logic inside or around this component
- Do not display prices in USD or non-lakh format
- Do not add a "Best Price" or "Lowest Rate" badge — these are directory patterns

---

## Notes

- The heart (shortlist) toggle is currently **local state only** (Phase 1). Phase 1.5 will connect it to the `shortlists` table via the shortlist service.
- The `Inquire` CTA currently has no routing destination (Phase 1 mock). Phase 1.5 will route to the requirements form with the venue pre-filled.
- Rating is displayed as editorial context only — it is not sortable and does not drive card order.
