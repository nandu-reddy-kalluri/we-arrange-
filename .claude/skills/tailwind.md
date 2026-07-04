# YMWA Skill Guide: Tailwind CSS

This document establishes the styling classes utility rules and theme tokens for YouMarriageWeArrange.

---

## 1. Using Mapped Tokens
Always use classes that extend the visual tokens in `tailwind.config.ts` rather than hardcoding values:
- **Colors:**
  - Primary Burgundy: `bg-primary` or `text-primary`
  - Accent Gold: `text-accent-gold` or `border-accent-gold`
  - Charcoal: `text-neutral-charcoal`
- **Radii:** `rounded-3xl` (luxury cards), `rounded-2xl` (content boxes).
- **Shadows:** `shadow-premium` (wine-tinted glow), `shadow-glass`.

## 2. Class Ordering Standards
Follow standard layout-to-visual Tailwind ordering to keep classes readable:
1. Display & Layout (`flex`, `grid`, `absolute`, `z-10`)
2. Box Model (`w-full`, `p-6`, `gap-4`)
3. Borders & Backgrounds (`bg-white`, `border`, `rounded-3xl`)
4. Typography & Colors (`font-serif`, `text-lg`, `text-neutral-charcoal`)
5. Interactions & Transitions (`hover:scale-105`, `transition-all`)
