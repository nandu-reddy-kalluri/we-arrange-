# YMWA UI & UX Rules

This document outlines visual design, layout rules, and responsiveness constraints for YouMarriageWeArrange.

---

## 1. Visual Token Rules
- Use HSL colors from `tailwind.config.ts` mapping the YMWA design system:
  - Background: `bg-neutral-cream` (`#FAF9F6`)
  - Primary text: `text-neutral-charcoal` (`#2D2D2D`)
  - Main Accent highlights: `text-primary` (`#8B263E`) or `text-accent-gold` (`#C5A880`)
- Maintain premium rounded shapes with `rounded-3xl` for major feature blocks and `rounded-2xl` for layout items.

## 2. Responsiveness Constraints (Mobile-First)
- Every feature layout must scale from mobile up to desktop:
  - **Mobile (< 768px):** Simple stack grids, horizontal swipe cards rows, and accessible thumb controls.
  - **Tablet (768px - 1024px):** Dual column listings.
  - **Desktop (>= 1024px):** Cinematic layouts, detailed metadata side-columns, and parallax assets.

## 3. UI Journey Trust Rules
Every section must explicitly address these visual cues for clients:
- **Trust:** Show validation badges, concierge uptime indicators, and clear service details.
- **Next Step:** Maintain a strong call-to-action to proceed with requirements selection.
