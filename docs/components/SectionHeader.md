# Component: SectionHeader

**File:** `src/components/ui/SectionHeader.tsx` — **[RECOMMENDED FOR EXTRACTION]**
**Status:** Pattern exists inline in every section. Should be extracted as a shared component.

---

## Purpose

Renders the standardised section header used consistently across all 10 homepage sections and future interior pages.

Every homepage section (DREAM, PLAN, COMPARE, CHOOSE, CELEBRATE) uses the same header anatomy. Currently this markup is duplicated inline in each section component. It should be extracted into a shared `SectionHeader` component.

---

## Current Inline Pattern (found in every section)

```tsx
<div className="text-center mb-16 flex flex-col items-center gap-3">
  <span className="font-sans text-[10px] font-black uppercase text-[#C5A880] tracking-[0.25em]">
    STAGE • Subtitle Label
  </span>
  <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#2D2D2D]">
    Section Heading
  </h2>
  <p className="text-xs sm:text-sm font-semibold text-[#6D6D6D] max-w-lg leading-relaxed mt-1">
    Section description copy.
  </p>
  <div className="w-14 h-[2px] bg-gradient-to-r from-[#C5A880] to-[#8B263E] mt-2" />
</div>
```

---

## Planned Props (when extracted)

```typescript
interface SectionHeaderProps {
  stage: string;           // Journey stage label: "DREAM", "PLAN", "COMPARE", "CHOOSE", "CELEBRATE"
  stageLabel?: string;     // Optional subtitle after the bullet: "Hyderabad's Elite Concierge"
  heading: string;         // Main h2 text
  description?: string;    // Optional subheadline paragraph
  align?: "center" | "left"; // Default: "center"
  className?: string;      // Optional override for custom spacing
}
```

---

## Planned Usage (after extraction)

```tsx
import SectionHeader from "@/components/ui/SectionHeader";

<SectionHeader
  stage="DREAM"
  stageLabel="Hyderabad's Elite Wedding Concierge"
  heading="Your Wedding Story Begins Here"
  description="Tell us about your wedding and we'll help you find the perfect venues and vendors."
/>
```

---

## Journey Stage → Color Mapping

The `stage` prop controls the eyebrow label color:

| Stage | Color Token |
|:---|:---|
| DREAM | `text-accent-gold` (`#C5A880`) |
| PLAN | `text-accent-gold` |
| COMPARE | `text-accent-gold` |
| CHOOSE | `text-accent-gold` |
| CELEBRATE | `text-primary` (`#8B263E`) — celebrate uses warmer accent |

---

## Do's ✅

- Always use `<h2>` for section headings (one `<h1>` per page in the Hero)
- Use `font-serif` (Playfair Display) for the main heading
- Keep description text under 20 words on mobile
- Place the gradient divider line after every section description

## Don'ts ❌

- Do not use `<h1>` for section headers — that is reserved for the Hero
- Do not use the section header pattern for card headings inside a section
- Do not place the stage label in a different color than `text-accent-gold` without design approval
- Do not remove the gradient divider line — it is a brand consistency element

---

## Extraction Priority

**Effort:** Low (1–2 hours)
**Impact:** High — eliminates ~150 lines of duplicated markup across 10+ components
**Recommended in:** Phase 1 cleanup sprint

Sections to update after extraction:
- `HeroSection.tsx` (embedded heading)
- `WhyChooseUs.tsx`
- `HowItWorks.tsx`
- `VenueSection.tsx`
- `VendorSection.tsx`
- `InvitationSection.tsx`
- `WebsiteSection.tsx`
- `InspirationSection.tsx`
- `Testimonials.tsx`
- `CelebrateSection.tsx`
