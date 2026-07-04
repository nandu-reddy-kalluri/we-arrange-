# Component: QuoteCard

**File:** `src/components/cards/QuoteCard.tsx` — **[PLANNED — Phase 1.5]**
**Status:** Not yet implemented

---

## Purpose

Displays a single Quote collected by a YMWA Concierge Specialist for a specific Requirement. Used in the Comparison Sheet view inside the Customer Dashboard.

This component is the visual representation of a manually assembled Quote. It must convey the specialist's curation, not an automated result.

---

## Planned Props

```typescript
interface QuoteCardProps {
  quote: Quote;
  isRecommended?: boolean;   // Specialist-marked recommendation highlight
  onSelect?: () => void;     // Callback when couple selects this quote
}

interface Quote {
  id: string;
  venueName: string;
  venueLocation: string;
  packageName: string;
  baseCostLakhs: number;     // Always in lakhs
  cateringModel: "in_house" | "external_allowed" | "flexible";
  inclusions: string[];
  exclusions: string[];
  specialistNotes: string;   // The most important field — must be prominently displayed
  validUntil: string;        // ISO date string
  collectedBy: string;       // Specialist name for trust attribution
}
```

---

## Variants

| Variant | Trigger | Visual Treatment |
|:---|:---|:---|
| **Default** | `isRecommended={false}` | Standard white card |
| **Recommended** | `isRecommended={true}` | Champagne gold border, "Specialist Recommended" badge |
| **Selected** | After `onSelect()` fires | Burgundy border, checkmark |

---

## Design Requirements

- **Specialist Notes** must have prominent visual weight — larger font, slightly different background. This is what differentiates a concierge quote from a scraped price.
- **Catering model** must use terminology from `PROJECT_GLOSSARY.md`: "In-House Catering" or "External Catering Allowed"
- **Price** must display as `₹{baseCostLakhs}L` — never as a raw decimal number
- **Valid Until** must use deterministic string formatting (no `toLocaleDateString()`)
- **Collected By** attribution (specialist name) must appear at the bottom as a trust signal

## Do's ✅

- Show inclusions as a green-tick list
- Show exclusions as a red-cross list (or clearly demarcated)
- Display the specialist name as "Curated by [Name], YMWA Specialist"
- Allow the card to be selectable (keyboard accessible, role="button" pattern)

## Don'ts ❌

- Do not sort quotes by `baseCostLakhs` — use specialist-recommended order
- Do not use star ratings as the primary decision signal on this card
- Do not label any quote as "Best Price" or "Cheapest Option"
- Do not show the quote without `specialistNotes` — if notes are empty, show "Your specialist is finalising notes."

---

## Implementation Notes (for when this is built)

- This is a **client component** (`"use client"`) because of selection state
- Use `motion.div` from Framer Motion for the selection transition animation
- The `onSelect` callback should update the parent `comparison` state, not directly call a Supabase mutation
- The Supabase mutation (updating `requirements.status = decision_made`) lives in the comparison service
